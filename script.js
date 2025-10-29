import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
import { authenticator } from 'otpauth'; // Note: This is a placeholder - see notes below

const supabaseUrl = 'https://mikburnhaxlrawloyfzx.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pa2J1cm5oYXhscmF3bG95Znp4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyOTIyMTMsImV4cCI6MjA3Njg2ODIxM30.YAskHQVs8xjhTKuuwPXcUnGt2sYhZZN9Wg5UB28fFP0';
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// TOTP Utility Functions
class TOTPManager {
  constructor() {
    this.secret = null;
  }

  generateSecret() {
    return authenticator.generateSecret(); // Generates a 32-byte base32 secret
  }

  generateQRCode(userEmail, secret) {
    const otpauth = authenticator.generateURL({
      name: userEmail,
      issuer: 'LOAN Financially Health',
      secret: secret,
    });
    return otpauth;
  }

  verifyToken(secret, token) {
    return authenticator.checkToken(secret, token);
  }
}

const totpManager = new TOTPManager();

// Global variables
let currentUserEmail = null;
let tempSecret = null;

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', async () => {
  // Auth check
  const { data: { session } } = await supabase.auth.getSession();
  if (session) {
    currentUserEmail = session.user.email;
    initAuthenticatedUser();
  }

  // Event listeners
  initEventListeners();
});

function initEventListeners() {
  const loginForm = document.getElementById('login-form');
  const signupForm = document.getElementById('signup-form');
  const resetPasswordForm = document.getElementById('reset-password-form');
  const resetPasswordConfirmForm = document.getElementById('reset-password-confirm-form');
  const setup2faForm = document.getElementById('setup-2fa-form');
  const verify2faForm = document.getElementById('2fa-verify-form');
  const logoutBtn = document.getElementById('logout-btn');
  const logoutLink = document.getElementById('logout-link');

  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }

  if (signupForm) {
    signupForm.addEventListener('submit', handleSignup);
  }

  if (resetPasswordForm) {
    resetPasswordForm.addEventListener('submit', handlePasswordReset);
  }

  if (resetPasswordConfirmForm) {
    resetPasswordConfirmForm.addEventListener('submit', handlePasswordUpdate);
  }

  if (setup2faForm) {
    setup2faForm.addEventListener('submit', handleSetup2FA);
  }

  if (verify2faForm) {
    verify2faForm.addEventListener('submit', handleVerify2FA);
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', handleLogout);
  }

  if (logoutLink) {
    logoutLink.addEventListener('click', (e) => {
      e.preventDefault();
      if (confirm('Are you sure you want to log out?')) {
        handleLogout();
      }
    });
  }
}

async function handleLogin(e) {
  e.preventDefault();
  const email = e.target.querySelector('input[type="email"]').value;
  const password = e.target.querySelector('input[type="password"]').value;

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    alert('Login failed: ' + error.message);
    return;
  }

  // Check if 2FA is enabled for this user
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('totp_secret')
    .eq('user_id', data.user.id)
    .single();

  if (profile && profile.totp_secret) {
    // 2FA enabled, redirect to verification
    sessionStorage.setItem('pendingUserId', data.user.id);
    window.location.href = '2fa-verify.html';
  } else {
    // No 2FA, redirect to setup or dashboard
    const { data: hasProfile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', data.user.id)
      .single();

    if (!hasProfile) {
      window.location.href = 'setup-2fa.html';
    } else {
      window.location.href = 'dashboard.html';
    }
  }
}

async function handleSignup(e) {
  e.preventDefault();
  const name = e.target.querySelector('input[placeholder="Name:"]').value;
  const surname = e.target.querySelector('input[placeholder="Surname:"]').value;
  const email = e.target.querySelector('input[type="email"]').value;
  const password = e.target.querySelector('input[type="password"]').value;

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name, surname },
    },
  });

  if (error) {
    alert('Signup failed: ' + error.message);
  } else {
    alert('Signup successful! Please check your email for verification.');
    window.location.href = 'login.html';
  }
}

async function handlePasswordReset(e) {
  e.preventDefault();
  const email = e.target.querySelector('input[type="email"]').value;

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password-confirm.html`,
  });

  if (error) {
    alert('Password reset failed: ' + error.message);
  } else {
    alert('Password reset link sent! Check your email.');
    window.location.href = 'login.html';
  }
}

async function handlePasswordUpdate(e) {
  e.preventDefault();
  const newPassword = document.getElementById('new-password').value;
  const confirmPassword = document.getElementById('confirm-password').value;

  if (newPassword !== confirmPassword) {
    alert('Passwords do not match!');
    return;
  }

  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    alert('Password update failed: ' + error.message);
  } else {
    alert('Password updated successfully!');
    window.location.href = 'login.html';
  }
}

async function handleSetup2FA(e) {
  e.preventDefault();
  const code = document.getElementById('verification-code').value;

  if (!tempSecret) {
    alert('Please refresh and scan the QR code first.');
    return;
  }

  const isValid = totpManager.verifyToken(tempSecret, code);
  if (!isValid) {
    alert('Invalid verification code. Please try again.');
    return;
  }

  // Enable 2FA for user
  const userId = (await supabase.auth.getUser()).data.user.id;
  const { error } = await supabase
    .from('user_profiles')
    .upsert({
      user_id: userId,
      totp_secret: tempSecret,
      updated_at: new Date().toISOString(),
    });

  if (error) {
    alert('Failed to enable 2FA: ' + error.message);
  } else {
    alert('2FA enabled successfully!');
    window.location.href = 'dashboard.html';
  }
}

async function handleVerify2FA(e) {
  e.preventDefault();
  const code = document.getElementById('totp-code').value;
  const pendingUserId = sessionStorage.getItem('pendingUserId');

  if (!pendingUserId) {
    alert('Session expired. Please login again.');
    window.location.href = 'login.html';
    return;
  }

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('totp_secret')
    .eq('user_id', pendingUserId)
    .single();

  if (!profile || !profile.totp_secret) {
    alert('2FA not configured. Please contact support.');
    return;
  }

  const isValid = totpManager.verifyToken(profile.totp_secret, code);
  if (!isValid) {
    alert('Invalid 2FA code. Please try again.');
    return;
  }

  // 2FA verified, complete login
  await supabase.auth.setSession({
    access_token: sessionStorage.getItem('tempAccessToken'), // You'd store this temporarily after initial login
    refresh_token: sessionStorage.getItem('tempRefreshToken'),
  });

  sessionStorage.removeItem('pendingUserId');
  sessionStorage.removeItem('tempAccessToken');
  sessionStorage.removeItem('tempRefreshToken');

  window.location.href = 'dashboard.html';
}

async function handleLogout() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    alert('Logout failed: ' + error.message);
  } else {
    window.location.href = 'login.html';
  }
}

async function initAuthenticatedUser() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  // Update dashboard
  if (document.getElementById('user-name')) {
    const { data: profile } = await supabase
      .from('users')
      .select('name')
      .eq('id', user.id)
      .single();
    document.getElementById('user-name').textContent = `Welcome, ${profile?.name || 'User'}`;
  }

  if (document.getElementById('user-email')) {
    document.getElementById('user-email').textContent = user.email;
  }

  // Check 2FA status
  if (document.getElementById('2fa-status')) {
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('totp_secret')
      .eq('user_id', user.id)
      .single();
    document.getElementById('2fa-status').textContent = profile?.totp_secret ? '2FA Status: Enabled' : '2FA Status: Not Enabled';
  }

  // Setup 2FA QR code generation
  const setupContainer = document.querySelector('.auth-container');
  if (setupContainer && window.location.pathname.includes('setup-2fa')) {
    await generateSetupQR();
  }
}

async function generateSetupQR() {
  tempSecret = totpManager.generateSecret();
  const qrUrl = totpManager.generateQRCode(currentUserEmail, tempSecret);
  
  document.getElementById('secret-key').textContent = `Secret: ${tempSecret}`;
  
  // Generate QR code
  QRCode.toCanvas(document.getElementById('qrcode-container'), qrUrl, { width: 200 }, (error) => {
    if (error) console.error('QR generation failed:', error);
  });
}

// Note: For production, implement proper session handling for 2FA flow
// The otpauth library needs to be included via CDN or bundled
// Add proper error handling, rate limiting, and backup codes for robustness