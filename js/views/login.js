// js/views/login.js : #/login (optional sync sign-in)
import { icon } from '../icons.js';

const STATUS_TEXT = {
  local: 'שמור במכשיר הזה',
  syncing: 'מתחבר...',
  synced: 'מסונכרן',
  error: 'הסנכרון לא זמין',
};

export function render(root, ctx) {
  const { store } = ctx;
  const status = store.getSyncStatus();

  root.innerHTML = `
    <div class="login-page">
      <h1>סנכרון בין מכשירים</h1>
      <p>אפשר להתחבר עם אותו אימייל וסיסמה של היומן, ואז ההתקדמות תישמר גם בטלפון וגם במחשב.</p>
      <div class="login-status">${icon(status === 'synced' ? 'cloud' : 'cloud-off', 'sm')} סטטוס: ${STATUS_TEXT[status] || STATUS_TEXT.local}</div>
      ${
        status === 'synced'
          ? ''
          : `<form id="login-form" novalidate>
              <div class="login-field">
                <label for="login-email">אימייל</label>
                <input type="email" id="login-email" autocomplete="email" required>
              </div>
              <div class="login-field">
                <label for="login-password">סיסמה</label>
                <input type="password" id="login-password" autocomplete="current-password" required>
              </div>
              <button type="submit" class="btn">מתחברים</button>
              <p class="login-error" id="login-error" hidden></p>
            </form>`
      }
      <p class="login-status">אין חובה להתחבר. הכל עובד גם ככה, ונשמר במכשיר הזה.</p>
    </div>
  `;

  const form = root.querySelector('#login-form');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = root.querySelector('#login-email').value.trim();
      const password = root.querySelector('#login-password').value;
      const errEl = root.querySelector('#login-error');
      errEl.hidden = true;
      const btn = form.querySelector('button[type="submit"]');
      btn.disabled = true;
      btn.textContent = 'מתחבר...';
      try {
        await store.signIn(email, password);
        ctx.rerender();
      } catch (err) {
        errEl.hidden = false;
        errEl.textContent = 'ההתחברות לא הצליחה. אפשר לבדוק את האימייל והסיסמה ולנסות שוב.';
        btn.disabled = false;
        btn.textContent = 'מתחברים';
      }
    });
  }
}
