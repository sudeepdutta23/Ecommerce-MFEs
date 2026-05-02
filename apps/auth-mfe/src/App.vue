<script setup lang="ts">
import { ref } from 'vue'
import { Zap } from 'lucide-vue-next'

const emailOrMobile = ref('')

const onSubmit = () => {
  if (emailOrMobile.value) {
    // Navigate back to home or dispatch event
    const event = new CustomEvent('auth:login_success', { 
      detail: { username: emailOrMobile.value } 
    });
    window.dispatchEvent(event);
  }
}
</script>

<template>
  <div class="auth-mfe-container">
    <div class="auth-logo-container">
      <div class="harbormart-logo">
        <Zap :size="32" :stroke-width="2.5" />
        <span class="harbormart-text">HarborMart</span>
      </div>
    </div>

    <div class="auth-card">
      <h1 class="auth-title">Sign in or create account</h1>
      
      <form @submit.prevent="onSubmit" class="auth-form">
        <div class="form-group">
          <label for="email" class="form-label">Enter mobile number or email</label>
          <input 
            id="email"
            v-model="emailOrMobile"
            type="text" 
            class="form-input" 
            required
          />
        </div>
        
        <button type="submit" class="auth-btn">Continue</button>
      </form>

      <div class="auth-agreement">
        By continuing, you agree to HarborMart's <a href="#">Conditions of Use</a> and <a href="#">Privacy Notice</a>.
      </div>

      <div class="auth-business">
        <p><strong>Buying for work?</strong></p>
        <a href="#">Create a free business account</a>
      </div>
    </div>

    <!-- <div class="auth-footer-divider"></div> -->

    <!-- <div class="auth-footer">
      <div class="auth-footer-links">
        <a href="#">Conditions of Use</a>
        <a href="#">Privacy Notice</a>
        <a href="#">Help</a>
      </div>
      <p class="auth-copyright">© 1996-2026, HarborMart.com, Inc. or its affiliates</p>
    </div> -->
  </div>
</template>
