<?php
// Testaurant PLUS - api.php (compat, LIMIT/OFFSET inlined, currency-ready)
declare(strict_types=1);

require __DIR__ . '/db.php';
$cfg = require __DIR__ . '/config.php';

// -------- Currency helpers (require exchange_rates table) --------
function pick_currency() {
  $cfg = require __DIR__ . '/config.php';
  $base = strtoupper($cfg['base_currency'] ?? 'RON');
  $supported = $cfg['supported_currencies'] ?? ['RON','EUR','USD'];
  $c = isset($_GET['currency']) ? strtoupper(trim($_GET['currency'])) : $base;
  return in_array($c, $supported, true) ? $c : $base;
}
function get_rate($to) {
  $cfg = require __DIR__ . '/config.php';
  $base = strtoupper($cfg['base_currency'] ?? 'RON');
  $to   = strtoupper($to);
  if ($to === $base) return 1.0;
  $st = db()->prepare('SELECT rate FROM exchange_rates WHERE base_currency=? AND currency=?');
  $st->execute([$base, $to]);
  $r = $st->fetch();
  return $r ? (float)$r['rate'] : 1.0;
}
function conv($amount, $currency) {
  return round(((float)$amount) * get_rate($currency), 2);
}

// ---- TEMP: show errors during setup (disable later) ----
error_reporting(E_ALL);
ini_set('display_errors', '1');

// ---- CORS ----
header('Access-Control-Allow-Origin: ' . $cfg['allow_origin']);
header('Access-Control-Allow-Methods: GET, POST, PUT, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-API-Key, Idempotency-Key');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

// ---- Routing boilerplate ----
$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH) ?: '/';
$apiPos = strpos($path, '/api/'); if ($apiPos !== false) { $path = substr($path, $apiPos); }

if ($path === '/' || $path === '/api') {
  header('Content-Type: application/json; charset=utf-8');
  echo json_encode(['ok'=>true,'message'=>'Testaurant PLUS API (compat, currency)']);
  exit;
}

// ---- Helpers ----
function json_input(){ $raw=file_get_contents('php://input'); $d=json_decode($raw?:'',true); return is_array($d)?$d:[]; }
function respond($data,$code=200){ header('Content-Type: application/json; charset=utf-8'); http_response_code($code); echo json_encode($data, JSON_UNESCAPED_UNICODE); exit; }
function require_admin_key(){ global $cfg; $k=$_SERVER['HTTP_X_API_KEY']??''; if($k!==$cfg['admin_api_key']) respond(['error'=>'Forbidden: invalid API key'],403); }
function chaos_hooks(){ $q=[]; if(isset($_SERVER['QUERY_STRING'])) parse_str($_SERVER['QUERY_STRING'],$q); if(isset($q['slow'])&&is_numeric($q['slow'])) usleep(((int)$q['slow'])*1000); if(!empty($q['chaos'])){ usleep(rand(100,1200)*1000); if(rand(1,10)===1) respond(['error'=>'Service temporarily unavailable (chaos)'],503);} }
function paginate(){ $p=max(1,(int)($_GET['page']??1)); $l=(int)($_GET['limit']??20); if($l<1)$l=1; if($l>100)$l=100; $o=($p-1)*$l; return [$l,$o,$p]; }
function find_coupon($code){ if(!$code) return null; $st=db()->prepare('SELECT * FROM coupons WHERE code=? AND active=1 AND (expires_at IS NULL OR expires_at > NOW())'); $st->execute([$code]); $r=$st->fetch(); return $r?:null; }
function price_cart($items,$coupon,$delivery){ global $cfg;
  $ids=[]; foreach($items as $i){ $ids[] = isset($i['id'])?(int)$i['id']:0; } $ids=array_values(array_filter($ids)); if(empty($ids)) respond(['error'=>'No valid item ids'],422);
  $in=implode(',', array_fill(0,count($ids),'?')); $st=db()->prepare("SELECT id,name,price,vat_rate,stock,available FROM menu_items WHERE id IN ($in)"); $st->execute($ids);
  $db=[]; foreach($st as $r){ $db[(int)$r['id']]=$r; }
  $lines=[]; $subtotal=0.0; $vatSum=0.0;
  foreach($items as $it){ $id=(int)($it['id']??0); $qty=(int)($it['qty']??0);
    if($id<=0||$qty<=0||empty($db[$id])||!$db[$id]['available']) respond(['error'=>'Invalid item','item'=>$it],422);
    if((int)$db[$id]['stock']<$qty) respond(['error'=>'Insufficient stock','itemId'=>$id,'requested'=>$qty,'stock'=>$db[$id]['stock']],409);
    $unit=(float)$db[$id]['price']; $vat=(float)$db[$id]['vat_rate']; $line=$unit*$qty; $subtotal+=$line; $vatSum+=$line*($vat/100.0);
    $lines[]=['id'=>$id,'qty'=>$qty,'unit'=>$unit,'vat_rate'=>$vat,'line_total'=>$line];
  }
  $discount=0.0; if($coupon){ $min=(float)$coupon['min_subtotal']; if($subtotal<$min) respond(['error'=>'Coupon conditions not met','minSubtotal'=>$min],422);
    if($coupon['type']==='percent') $discount=round($subtotal*((float)$coupon['value']/100.0),2); else $discount=(float)$coupon['value']; if($discount>$subtotal) $discount=$subtotal; }
  $deliveryFee = ($delivery==='delivery') ? (float)$cfg['delivery_fee'] : 0.0;
  $total = max(0.0, $subtotal-$discount) + $vatSum + $deliveryFee;
  return ['lines'=>$lines,'subtotal'=>round($subtotal,2),'discount'=>round($discount,2),'vat'=>round($vatSum,2),'deliveryFee'=>round($deliveryFee,2),'grandTotal'=>round($total,2)];
}
function record_status($orderId,$status,$note=null){ $st=db()->prepare('INSERT INTO order_status_history (order_id,status,note) VALUES (?,?,?)'); $st->execute([$orderId,$status,$note]); }

// ---- Dispatch ----
if (strpos($path, '/api/') !== 0) respond(['error'=>'Not Found'],404);
$segments = explode('/', trim($path,'/'));
$resource = $segments[1] ?? '';

chaos_hooks();

try{
  switch($resource){

    case 'health':
      respond(['ok'=>true,'time'=>date('c')]);

    case 'categories':
      $st=db()->query('SELECT DISTINCT category FROM menu_items WHERE category IS NOT NULL ORDER BY category');
      $cats=[]; foreach($st as $r) $cats[]=$r['category']; respond(['categories'=>$cats]);
      
      case 'stats':
  if ($method !== 'GET') respond(['error'=>'Method Not Allowed'],405);
  require_admin_key();

  $from = $_GET['from'] ?? date('Y-m-d', strtotime('-6 days'));
  $to   = $_GET['to']   ?? date('Y-m-d');
  $currency = pick_currency();
  $base = strtoupper($cfg['base_currency'] ?? 'RON');

  // Orders by day
  $st = db()->prepare("
    SELECT DATE(created_at) d, COUNT(*) c, SUM(total_amount) s
    FROM orders
    WHERE created_at BETWEEN CONCAT(?, ' 00:00:00') AND CONCAT(?, ' 23:59:59')
    GROUP BY DATE(created_at) ORDER BY d
  ");
  $st->execute([$from, $to]);
  $by = $st->fetchAll();

  // Totals
  $totCount = 0; $totSum = 0.0;
  foreach ($by as $r){ $totCount += (int)$r['c']; $totSum += (float)$r['s']; }

  // Top items
  $ti = db()->prepare("
    SELECT mi.name, SUM(oi.quantity) qty, SUM(oi.line_total) revenue
    FROM order_items oi
    JOIN menu_items mi ON mi.id = oi.item_id
    JOIN orders o ON o.id = oi.order_id
    WHERE o.created_at BETWEEN CONCAT(?, ' 00:00:00') AND CONCAT(?, ' 23:59:59')
    GROUP BY mi.name
    ORDER BY qty DESC
    LIMIT 10
  ");
  $ti->execute([$from, $to]);
  $top = $ti->fetchAll();

  // Convert for display if needed
  if ($currency !== $base) {
    foreach ($by as &$r) { $r['s_display'] = conv($r['s'], $currency); }
    foreach ($top as &$t){ $t['revenue_display'] = conv($t['revenue'], $currency); }
  }

  respond([
    'from'=>$from, 'to'=>$to, 'currency'=>$currency,
    'orders_count'=>$totCount,
    'revenue_sum'=>$totSum,
    'revenue_display'=>($currency===$base)?$totSum:conv($totSum,$currency),
    'by_day'=>$by,
    'top_items'=>$top
  ]);


    case 'menu':
      if ($method==='GET'){
        list($limit,$offset,$page) = paginate();
        $q = isset($_GET['q']) ? trim($_GET['q']) : '';
        $cat = isset($_GET['category']) ? trim($_GET['category']) : '';
        $sql='SELECT id,name,description,category,price,vat_rate,stock,image_url,available FROM menu_items WHERE 1=1';
        $params=[];
        if($cat!==''){ $sql.=' AND category = ?'; $params[]=$cat; }
        if($q!==''){ $sql.=' AND (name LIKE ? OR description LIKE ?)'; $params[]="%$q%"; $params[]="%$q%"; }
        // inline validated ints for LIMIT/OFFSET
        $limit = (int)$limit; if($limit<1)$limit=20; if($limit>100)$limit=100;
        $offset = (int)$offset; if($offset<0)$offset=0;
        $sql.=' AND available=1 ORDER BY category,name LIMIT '.$limit.' OFFSET '.$offset;
        $st=db()->prepare($sql); $st->execute($params);
        $items = $st->fetchAll();

        // currency display
        $currency = pick_currency();
        $base = strtoupper($cfg['base_currency'] ?? 'RON');
        if ($currency !== $base) {
          foreach ($items as &$it) { $it['price_converted'] = conv($it['price'], $currency); }
        }
        respond(['items'=>$items,'page'=>$page,'limit'=>$limit,'currency'=>$currency]);
      }
      if ($method==='POST'){
        require_admin_key();
        $b=json_input();
        $st=db()->prepare('INSERT INTO menu_items (name,description,category,price,vat_rate,stock,image_url,available) VALUES (?,?,?,?,?,?,?,1)');
        $st->execute([$b['name']??'', $b['description']??null, $b['category']??null, (float)($b['price']??0), (float)($b['vat_rate']??9), (int)($b['stock']??0), $b['image_url']??null]);
        respond(['ok'=>true,'id'=>(int)db()->lastInsertId()],201);
      }
      respond(['error'=>'Method Not Allowed'],405);

    case 'rates':
      if ($method === 'GET') {
        require_admin_key();
        $base = $cfg['base_currency'] ?? 'RON';
        $st = db()->prepare('SELECT base_currency,currency,rate FROM exchange_rates WHERE base_currency=? ORDER BY currency');
        $st->execute([$base]);
        respond(['base'=>$base,'rates'=>$st->fetchAll()]);
      }
      if ($method === 'POST') {
        require_admin_key();
        $b = json_input();
        $cur = strtoupper($b['currency'] ?? '');
        $rate = (float)($b['rate'] ?? 0);
        if (!$cur || $rate <= 0) respond(['error'=>'Invalid rate'],422);
        $base = $cfg['base_currency'] ?? 'RON';
        $st = db()->prepare('INSERT INTO exchange_rates (base_currency,currency,rate) VALUES (?,?,?) ON DUPLICATE KEY UPDATE rate=VALUES(rate)');
        $st->execute([$base, $cur, $rate]);
        respond(['ok'=>true]);
      }
      respond(['error'=>'Method Not Allowed'],405);

    case 'menuitems':
      require_admin_key();
      $id=(int)($segments[2] ?? 0);
      if($id<=0) respond(['error'=>'Invalid id'],422);

      // Set availability
      if(($segments[3] ?? '')==='availability' && $method==='POST'){
        $b=json_input(); $avail=(int)($b['available']??1);
        $st=db()->prepare('UPDATE menu_items SET available=? WHERE id=?'); $st->execute([$avail,$id]);
        respond(['ok'=>true,'id'=>$id,'available'=>$avail]);
      }
      // Set absolute stock
      if(($segments[3] ?? '')==='stock' && $method==='PUT'){
        $b=json_input(); $stock = isset($b['stock']) ? (int)$b['stock'] : 0; if ($stock<0) $stock=0;
        $st=db()->prepare('UPDATE menu_items SET stock=? WHERE id=?'); $st->execute([$stock,$id]);
        respond(['ok'=>true,'id'=>$id,'stock'=>$stock]);
      }
      // Restock delta (+/-)
      if(($segments[3] ?? '')==='restock' && $method==='POST'){
        $b=json_input(); $delta = isset($b['delta']) ? (int)$b['delta'] : 0;
        $st=db()->prepare('UPDATE menu_items SET stock = GREATEST(0, stock + ?) WHERE id=?'); $st->execute([$delta,$id]);
        $cur = db()->prepare('SELECT stock FROM menu_items WHERE id=?'); $cur->execute([$id]);
        $newStock = (int)$cur->fetch()['stock'];
        respond(['ok'=>true,'id'=>$id,'stock'=>$newStock]);
      }
      // Update item
      if($method==='PUT'){
        $b=json_input();
        $st=db()->prepare('UPDATE menu_items SET name=?,description=?,category=?,price=?,vat_rate=?,stock=?,image_url=?,available=? WHERE id=?');
        $st->execute([$b['name'],$b['description']??null,$b['category']??null,(float)$b['price'],(float)$b['vat_rate'],(int)$b['stock'],$b['image_url']??null,(int)($b['available']??1),$id]);
        respond(['ok'=>true]);
      }
      respond(['error'=>'Not Found'],404);

    case 'inventory':
      if ($method !== 'GET') respond(['error'=>'Method Not Allowed'], 405);
      require_admin_key();
      $st = db()->query('SELECT id,name,category,price,vat_rate,stock,available FROM menu_items ORDER BY category,name');
      respond(['items'=>$st->fetchAll()]);

    case 'cart':
      // price quote (base RON + optional converted fields)
      if(($segments[2] ?? '')==='price' && $method==='POST'){
        $b=json_input();
        $coupon = find_coupon($b['couponCode'] ?? null);
        $delivery = $b['deliveryMethod'] ?? 'pickup';
        $calc = price_cart($b['items'] ?? [], $coupon, $delivery);

        $base = strtoupper($cfg['base_currency'] ?? 'RON');
        $currency = isset($_GET['currency']) ? pick_currency() : strtoupper($b['currency'] ?? $base);
        if (!in_array($currency, $cfg['supported_currencies'] ?? ['RON','EUR','USD'], true)) $currency = $base;

        $out = [
          'subtotal'    => $calc['subtotal'],
          'discount'    => $calc['discount'],
          'vat'         => $calc['vat'],
          'deliveryFee' => $calc['deliveryFee'],
          'grandTotal'  => $calc['grandTotal'],
          'baseCurrency'=> $base,
          'currency'    => $currency
        ];
        if ($currency !== $base) {
          $out['subtotal_converted']    = conv($out['subtotal'],    $currency);
          $out['discount_converted']    = conv($out['discount'],    $currency);
          $out['vat_converted']         = conv($out['vat'],         $currency);
          $out['deliveryFee_converted'] = conv($out['deliveryFee'], $currency);
          $out['grandTotal_converted']  = conv($out['grandTotal'],  $currency);
        }
        respond($out);
      }
      respond(['error'=>'Not Found'],404);

    case 'coupons':
      if(($segments[2] ?? '')==='validate' && $method==='GET'){
        $code=isset($_GET['code'])?trim($_GET['code']):'';
        $c=find_coupon($code); if(!$c) respond(['valid'=>false],200);
        respond(['valid'=>true,'coupon'=>['code'=>$c['code'],'type'=>$c['type'],'value'=>(float)$c['value'],'minSubtotal'=>(float)$c['min_subtotal']]]);
      }
      if($method==='POST'){
        require_admin_key();
        $b=json_input();
        $st=db()->prepare('INSERT INTO coupons (code,type,value,active,min_subtotal,expires_at) VALUES (?,?,?,?,?,?)');
        $st->execute([$b['code'],$b['type'],(float)$b['value'],(int)($b['active']??1),(float)($b['min_subtotal']??0),$b['expires_at']??null]);
        respond(['ok'=>true],201);
      }
      respond(['error'=>'Not Found'],404);

    case 'checkout':
      if ($method!=='POST') respond(['error'=>'Method Not Allowed'],405);
      $b=json_input();
      $name=trim($b['customerName']??''); $phone=trim($b['customerPhone']??''); $items=$b['items']??[];
      $pay=$b['paymentMethod']??'cash'; $del=$b['deliveryMethod']??'pickup';
      if($name===''||$phone===''||!is_array($items)||count($items)===0) respond(['error'=>'Invalid input','details'=>'customerName, customerPhone, items[] required'],422);
      if(!in_array($pay,['cash','card'],true)) respond(['error'=>'Unsupported paymentMethod'],422);
      if(!in_array($del,['pickup','delivery'],true)) respond(['error'=>'Invalid deliveryMethod'],422);

      // Idempotency
      $idem=$_SERVER['HTTP_IDEMPOTENCY_KEY'] ?? null;
      if($idem){
        $chk=db()->prepare('SELECT order_id FROM idempotency_keys WHERE idem_key=?'); $chk->execute([$idem]);
        if($row=$chk->fetch()){
          $oid=(int)$row['order_id']; $o=db()->prepare('SELECT total_amount FROM orders WHERE id=?'); $o->execute([$oid]);
          $tot=(float)($o->fetch()['total_amount']); respond(['orderId'=>$oid,'status'=>'created','total'=>$tot]);
        }
      }

      $coupon=find_coupon($b['couponCode'] ?? null);
      $calc=price_cart($items,$coupon,$del);

      db()->beginTransaction();
      $st=db()->prepare('INSERT INTO orders (customer_name, customer_phone, address_line1, city, postal_code, delivery_method, subtotal, discount, vat_amount, delivery_fee, total_amount, status) VALUES (?,?,?,?,?,?,?,?,?,?,?, "created")');
      $st->execute([$name,$phone,$b['addressLine1']??null,$b['city']??null,$b['postalCode']??null,$del,$calc['subtotal'],$calc['discount'],$calc['vat'],$calc['deliveryFee'],$calc['grandTotal']]);
      $orderId=(int)db()->lastInsertId();
      record_status($orderId,'created','Order placed');

      $sti=db()->prepare('INSERT INTO order_items (order_id, item_id, quantity, unit_price, vat_rate, line_total) VALUES (?,?,?,?,?,?)');
      $upd=db()->prepare('UPDATE menu_items SET stock = stock - ? WHERE id=?');
      foreach($calc['lines'] as $ln){ $sti->execute([$orderId,$ln['id'],$ln['qty'],$ln['unit'],$ln['vat_rate'],$ln['line_total']]); $upd->execute([$ln['qty'],$ln['id']]); }

      $payStatus=$pay==='card'?'captured':'authorized'; $tx=bin2hex(random_bytes(6));
      $sp=db()->prepare('INSERT INTO payments (order_id, amount, method, status, transaction_id) VALUES (?,?,?,?,?)'); $sp->execute([$orderId,$calc['grandTotal'],$pay,$payStatus,$tx]);

      if($idem){ $si=db()->prepare('INSERT INTO idempotency_keys (idem_key, order_id) VALUES (?,?)'); $si->execute([$idem,$orderId]); }
      db()->commit();

      // response with display currency
      $base = strtoupper($cfg['base_currency'] ?? 'RON');
      $currency = pick_currency();
      $displayTotal = ($currency === $base) ? round($calc['grandTotal'],2) : conv($calc['grandTotal'], $currency);

      respond(['orderId'=>$orderId,'status'=>'created','total'=>round($calc['grandTotal'],2),'displayTotal'=>$displayTotal,'currency'=>$currency,'payment'=>['status'=>$payStatus,'transactionId'=>$tx]]);

    case 'orders':
      if (!isset($segments[2])){
        if ($method!=='GET') respond(['error'=>'Method Not Allowed'],405);
        require_admin_key();
        list($limit,$offset,$page) = paginate();
        $limit=(int)$limit; if($limit<1)$limit=20; if($limit>100)$limit=100; $offset=(int)$offset; if($offset<0)$offset=0;

        $sql = "SELECT id, customer_name, total_amount, status, created_at FROM orders ORDER BY id DESC LIMIT $limit OFFSET $offset";
        $st = db()->prepare($sql); $st->execute([]);
        $orders = $st->fetchAll();

        // display currency
        $currency = pick_currency();
        $base = strtoupper($cfg['base_currency'] ?? 'RON');
        foreach ($orders as &$o) {
          $o['total_amount_display'] = ($currency === $base) ? (float)$o['total_amount'] : conv($o['total_amount'], $currency);
        }
        respond(['orders'=>$orders,'page'=>$page,'limit'=>$limit,'currency'=>$currency]);
      } else {
        $id=(int)$segments[2]; if($id<=0) respond(['error'=>'Invalid id'],422);

        if (($segments[3] ?? '')==='history'){
          if($method!=='GET') respond(['error'=>'Method Not Allowed'],405);
          $h=db()->prepare('SELECT status, note, created_at FROM order_status_history WHERE order_id=? ORDER BY id ASC'); $h->execute([$id]);
          respond(['history'=>$h->fetchAll()]);
        }

        if (($segments[3] ?? '')==='status'){
          if($method!=='POST') respond(['error'=>'Method Not Allowed'],405);
          require_admin_key();
          $b=json_input(); $status=$b['status'] ?? ''; $allowed=['created','preparing','ready','delivered','cancelled'];
          if(!in_array($status,$allowed,true)) respond(['error'=>'Invalid status','allowed'=>$allowed],422);
          $st=db()->prepare('UPDATE orders SET status=? WHERE id=?'); $st->execute([$status,$id]);
          record_status($id,$status,$b['note'] ?? null);
          respond(['ok'=>true,'orderId'=>$id,'status'=>$status]);
        }

        if ($method!=='GET') respond(['error'=>'Method Not Allowed'],405);
        $o=db()->prepare('SELECT id, customer_name, customer_phone, address_line1, city, postal_code, delivery_method, subtotal, discount, vat_amount, delivery_fee, total_amount, status, created_at FROM orders WHERE id=?');
        $o->execute([$id]); $order=$o->fetch(); if(!$order) respond(['error'=>'Not Found'],404);

        $items=db()->prepare('SELECT oi.item_id, mi.name, oi.quantity, oi.unit_price, oi.vat_rate, oi.line_total FROM order_items oi JOIN menu_items mi ON mi.id = oi.item_id WHERE oi.order_id=?');
        $items->execute([$id]); $order['items']=$items->fetchAll();

        $pay=db()->prepare('SELECT method, status, transaction_id, created_at FROM payments WHERE order_id=? ORDER BY id DESC LIMIT 1'); $pay->execute([$id]); $order['payment']=$pay->fetch() ?: null;

        // convert display fields
        $currency = pick_currency();
        $base = strtoupper($cfg['base_currency'] ?? 'RON');
        $order['total_amount_display'] = ($currency === $base) ? (float)$order['total_amount'] : conv($order['total_amount'], $currency);
        foreach ($order['items'] as &$ln) {
          $ln['unit_price_display'] = ($currency === $base) ? (float)$ln['unit_price'] : conv($ln['unit_price'], $currency);
          $ln['line_total_display']  = ($currency === $base) ? (float)$ln['line_total']  : conv($ln['line_total'],  $currency);
        }

        respond($order);
      }

    case 'webhooks':
      if(($segments[2] ?? '')==='payment' && $method==='POST'){
        $b=json_input(); $orderId=(int)($b['orderId'] ?? 0); $status=$b['status'] ?? 'captured';
        $st=db()->prepare('UPDATE payments SET status=? WHERE order_id=?'); $st->execute([$status,$orderId]);
        record_status($orderId,'payment_'.$status,'Webhook update');
        respond(['ok'=>true]);
      }
      respond(['error'=>'Not Found'],404);

    default:
      respond(['error'=>'Not Found'],404);
  }
} catch (Throwable $e){
  if(isset($_GET['debug'])) respond(['error'=>'Server error','message'=>$e->getMessage(),'trace'=>$e->getTraceAsString()],500);
  respond(['error'=>'Server error'],500);
}
