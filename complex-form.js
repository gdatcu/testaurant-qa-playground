document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('complex-form');
    const resultDiv = document.getElementById('form-result');

    // --- Field References ---
    const username = document.getElementById('username');
    const email = document.getElementById('email');
    const password = document.getElementById('password');
    const confirmPassword = document.getElementById('confirm-password');
    const membership = document.getElementById('membership-level');
    const companySection = document.getElementById('company-info-section');
    const companyName = document.getElementById('company-name');

    // --- Validation Logic ---
    const showError = (input, message) => {
        const formGroup = input.parentElement;
        const errorDiv = formGroup.querySelector('.error-message');
        input.classList.add('invalid');
        input.classList.remove('valid');
        errorDiv.textContent = message;
    };

    const showSuccess = (input) => {
        const formGroup = input.parentElement;
        const errorDiv = formGroup.querySelector('.error-message');
        input.classList.add('valid');
        input.classList.remove('invalid');
        errorDiv.textContent = '';
    };

    const validateField = (input) => {
        let message = '';
        if (!input.checkValidity()) {
            if (input.validity.valueMissing) message = 'This field is required.';
            else if (input.validity.tooShort) message = `Must be at least ${input.minLength} characters.`;
            else if (input.validity.patternMismatch) message = 'Password format is incorrect.';
            else if (input.validity.typeMismatch) message = 'Please enter a valid email address.';
            showError(input, message);
            return false;
        } else {
            showSuccess(input);
            return true;
        }
    };

    const validatePasswordsMatch = () => {
        if (password.value !== confirmPassword.value) {
            showError(confirmPassword, 'Passwords do not match.');
            return false;
        } else if (confirmPassword.value) {
            showSuccess(confirmPassword);
            return true;
        }
        return false;
    };
    
    // --- Event Listeners ---
    form.addEventListener('input', (e) => {
        const input = e.target;
        if (input.id === 'confirm-password') {
            validatePasswordsMatch();
        } else {
            validateField(input);
        }
    });

    membership.addEventListener('change', () => {
        if (membership.value === 'gold') {
            companySection.style.display = 'block';
            companyName.required = true;
        } else {
            companySection.style.display = 'none';
            companyName.required = false;
        }
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        let isFormValid = true;
        const inputs = form.querySelectorAll('input[required], select[required]');

        inputs.forEach(input => {
            if (!validateField(input)) isFormValid = false;
        });
        
        if (!validatePasswordsMatch()) isFormValid = false;
        
        resultDiv.style.display = 'block';
        if (isFormValid) {
            resultDiv.textContent = 'Form submitted successfully!';
            resultDiv.style.borderColor = '#22c55e';
        } else {
            resultDiv.textContent = 'Please correct the errors before submitting.';
            resultDiv.style.borderColor = '#ef4444';
        }
    });
});