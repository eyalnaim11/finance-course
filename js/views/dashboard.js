// js/views/dashboard.js : #/dashboard: "הכסף שלי" (SPEC-EXTRAS.md §2).
// Two tabs, both fully editable, both preloaded with clearly-labeled example
// numbers. Nothing here is a student's real financial data: it lives only in
// this browser (store.js -> localStorage, optionally synced if signed in).
//
// Totals/progress bars are updated by patching just those elements after an
// input event, not by re-rendering the whole tab body: replacing innerHTML
// on every keystroke would reset focus and cursor position in the input the
// student is actively typing in.
import { moneyText, escapeHtml } from '../render-blocks.js';
import { OSEK_PATUR_CEILING_2026 } from '../../content/constants.js';

// example data preloaded on first visit (SPEC-EXTRAS.md §2). Generic, no
// personal info. store.getDashboard() returns null until the student edits
// something, at which point their edits replace these defaults entirely.
// Exported so the AI helper (js/ai-helper.js) can send the same example
// numbers the student is actually looking at when nothing is saved yet,
// instead of guessing or duplicating this object.
export function defaultDashboard() {
  return {
    personal: {
      income: [
        { label: 'משכורת מעבודה', amount: 1400 },
        { label: 'רווח מהחנות', amount: 600 },
      ],
      expenses: [
        { label: 'נסיעות', amount: 150 },
        { label: 'טלפון', amount: 60 },
        { label: 'בילויים', amount: 300 },
        { label: 'אוכל בחוץ', amount: 200 },
      ],
      goalAmount: 3000,
      goalMonthly: 300,
    },
    business: {
      months: [
        { name: 'יולי', sales: 2400, supplier: 1100, ads: 600, other: 50 },
        { name: 'אוגוסט', sales: 3100, supplier: 1400, ads: 750, other: 50 },
        { name: 'ספטמבר', sales: 2800, supplier: 1300, ads: 700, other: 80 },
      ],
      setAsidePct: 20,
    },
  };
}

function sum(arr, key) {
  return arr.reduce((total, row) => total + (Number(row[key]) || 0), 0);
}

function moneyVal(n) {
  return `<span class="v" dir="ltr">${moneyText(n)}</span>`;
}

function rowsHtml(rows, group, amountLabel) {
  return rows
    .map(
      (r, i) => `<div class="dash-row" data-group="${group}" data-i="${i}">
        <label class="dash-field dash-field-label">
          <span class="sr-only">שם</span>
          <input type="text" data-role="label" value="${escapeHtml(r.label)}">
        </label>
        <label class="dash-field dash-field-amount">
          <span class="sr-only">${amountLabel}</span>
          <input type="number" inputmode="decimal" data-role="amount" value="${r.amount}">
          <span class="suffix">₪</span>
        </label>
      </div>`
    )
    .join('');
}

function monthRowsHtml(months) {
  return months
    .map(
      (m, i) => `<div class="dash-month-row" data-i="${i}">
        <label class="dash-field"><span class="sr-only">חודש</span><input type="text" data-role="name" value="${escapeHtml(m.name)}"></label>
        <label class="dash-field"><span class="dash-col-label">מכירות</span><input type="number" inputmode="decimal" data-role="sales" value="${m.sales}"></label>
        <label class="dash-field"><span class="dash-col-label">ספק</span><input type="number" inputmode="decimal" data-role="supplier" value="${m.supplier}"></label>
        <label class="dash-field"><span class="dash-col-label">פרסום</span><input type="number" inputmode="decimal" data-role="ads" value="${m.ads}"></label>
        <label class="dash-field"><span class="dash-col-label">הוצאות אחרות</span><input type="number" inputmode="decimal" data-role="other" value="${m.other}"></label>
        <div class="dash-month-profit" data-role="profit"><span class="dash-col-label">רווח</span>${moneyVal(m.sales - m.supplier - m.ads - m.other)}</div>
      </div>`
    )
    .join('');
}

export async function render(root, ctx) {
  const { store } = ctx;
  let activeTab = location.hash.split('?')[1] === 'tab=business' ? 'business' : 'personal';
  let data = store.getDashboard() || defaultDashboard();

  root.innerHTML = `
    <div class="page dash-page">
      <div class="dash-head">
        <h1 class="lesson-title">הכסף שלי</h1>
        <button type="button" class="btn-outline" id="dash-reset-btn">איפוס לנתוני הדוגמה</button>
      </div>
      <p class="dash-note">נתוני דוגמה. אפשר לשנות כל מספר. נשמר רק במכשיר הזה ובסנכרון אם התחברת.</p>
      <div class="dash-tabs" role="tablist">
        <button type="button" class="dash-tab" data-tab="personal" role="tab">הכסף שלי</button>
        <button type="button" class="dash-tab" data-tab="business" role="tab">העסק שלי</button>
      </div>
      <div class="sheet"><div class="sheet-full" id="dash-body"></div></div>
    </div>
  `;

  const tabBtns = [...root.querySelectorAll('.dash-tab')];
  const bodyEl = root.querySelector('#dash-body');

  function save() {
    store.saveDashboard(data);
  }

  function renderPersonal() {
    const p = data.personal;

    bodyEl.innerHTML = `
      <h3 class="dash-h">הכנסה חודשית</h3>
      <div class="dash-rows" data-rows="income">${rowsHtml(p.income, 'income', 'סכום')}</div>
      <h3 class="dash-h">הוצאות חודשיות</h3>
      <div class="dash-rows" data-rows="expenses">${rowsHtml(p.expenses, 'expenses', 'סכום')}</div>
      <div class="dash-totals">
        <div class="dash-total-row"><span>סך הכנסה</span><span id="income-total">${moneyVal(sum(p.income, 'amount'))}</span></div>
        <div class="dash-total-row"><span>סך הוצאות</span><span id="expense-total">${moneyVal(sum(p.expenses, 'amount'))}</span></div>
        <div class="dash-total-row dash-total-main"><span>נשאר בסוף החודש</span><span id="left-total">${moneyVal(sum(p.income, 'amount') - sum(p.expenses, 'amount'))}</span></div>
      </div>
      <h3 class="dash-h">יעד חיסכון</h3>
      <div class="dash-goal">
        <label class="dash-field"><span class="dash-col-label">כמה רוצים לחסוך בסך הכל</span><input type="number" inputmode="decimal" id="goal-amount" value="${p.goalAmount}"><span class="suffix">₪</span></label>
        <label class="dash-field"><span class="dash-col-label">כמה חוסכים כל חודש</span><input type="number" inputmode="decimal" id="goal-monthly" value="${p.goalMonthly}"><span class="suffix">₪</span></label>
        <div class="dash-goal-result" id="goal-result"></div>
      </div>
    `;

    function recomputeTotals() {
      bodyEl.querySelector('#income-total').innerHTML = moneyVal(sum(p.income, 'amount'));
      bodyEl.querySelector('#expense-total').innerHTML = moneyVal(sum(p.expenses, 'amount'));
      bodyEl.querySelector('#left-total').innerHTML = moneyVal(sum(p.income, 'amount') - sum(p.expenses, 'amount'));
    }
    function recomputeGoal() {
      const months = p.goalMonthly > 0 ? Math.ceil(p.goalAmount / p.goalMonthly) : null;
      bodyEl.querySelector('#goal-result').innerHTML =
        months !== null ? `<b>${months.toLocaleString('en-US')}</b> חודשים ליעד` : 'צריך גם כמה חוסכים כל חודש כדי לחשב כמה חודשים ייקח';
    }
    recomputeGoal();

    function wireRows(group, rows) {
      bodyEl.querySelectorAll(`.dash-row[data-group="${group}"]`).forEach((rowEl) => {
        const i = Number(rowEl.dataset.i);
        rowEl.querySelector('[data-role="label"]').addEventListener('input', (e) => {
          rows[i].label = e.target.value;
          save();
        });
        rowEl.querySelector('[data-role="amount"]').addEventListener('input', (e) => {
          rows[i].amount = Number(e.target.value) || 0;
          save();
          recomputeTotals();
        });
      });
    }
    wireRows('income', p.income);
    wireRows('expenses', p.expenses);

    bodyEl.querySelector('#goal-amount').addEventListener('input', (e) => {
      p.goalAmount = Number(e.target.value) || 0;
      save();
      recomputeGoal();
    });
    bodyEl.querySelector('#goal-monthly').addEventListener('input', (e) => {
      p.goalMonthly = Number(e.target.value) || 0;
      save();
      recomputeGoal();
    });
  }

  function renderBusiness() {
    const b = data.business;
    const totalProfitOf = () => b.months.reduce((t, m) => t + (m.sales - m.supplier - m.ads - m.other), 0);

    bodyEl.innerHTML = `
      <h3 class="dash-h">חודשים</h3>
      <div class="table-wrap dash-months-wrap">
        <div class="dash-month-head">
          <span></span><span class="dash-col-label">מכירות</span><span class="dash-col-label">ספק</span><span class="dash-col-label">פרסום</span><span class="dash-col-label">הוצאות אחרות</span><span class="dash-col-label">רווח</span>
        </div>
        <div id="dash-months">${monthRowsHtml(b.months)}</div>
      </div>
      <div class="dash-totals">
        <div class="dash-total-row"><span>סך מכירות</span><span id="sales-total">${moneyVal(sum(b.months, 'sales'))}</span></div>
        <div class="dash-total-row dash-total-main"><span>סך רווח</span><span id="profit-total">${moneyVal(totalProfitOf())}</span></div>
      </div>

      <h3 class="dash-h">תקרת עוסק פטור 2026</h3>
      <div class="dash-ceiling">
        <div class="bar" id="ceiling-bar"><i></i></div>
        <div class="dash-ceiling-nums" id="ceiling-nums"></div>
      </div>

      <h3 class="dash-h">להפריש בצד (לדוגמה)</h3>
      <div class="dash-setaside">
        <label class="dash-field"><span class="dash-col-label">אחוז לדוגמה מהרווח</span><input type="number" inputmode="decimal" id="setaside-pct" value="${b.setAsidePct}"><span class="suffix">%</span></label>
        <div class="dash-setaside-result" id="setaside-result"></div>
      </div>
      <p class="dash-hint">אחוז לדוגמה בלבד. כמה באמת להפריש תבדוק עם רואה חשבון.</p>
    `;

    function recomputeTotals() {
      const totalSales = sum(b.months, 'sales');
      const totalProfit = totalProfitOf();
      const remaining = OSEK_PATUR_CEILING_2026 - totalSales;
      const pct = Math.max(0, Math.min(100, Math.round((totalSales / OSEK_PATUR_CEILING_2026) * 100)));
      bodyEl.querySelector('#sales-total').innerHTML = moneyVal(totalSales);
      bodyEl.querySelector('#profit-total').innerHTML = moneyVal(totalProfit);
      bodyEl.querySelector('#ceiling-bar i').style.width = `${pct}%`;
      bodyEl.querySelector('#ceiling-nums').innerHTML = `<span>${moneyText(totalSales)} מתוך ${moneyText(OSEK_PATUR_CEILING_2026)}</span><span>נשאר ${moneyText(remaining)}</span>`;
      bodyEl.querySelector('#setaside-result').innerHTML = moneyVal(totalProfit * (b.setAsidePct / 100));
    }
    recomputeTotals();

    bodyEl.querySelectorAll('.dash-month-row').forEach((rowEl) => {
      const i = Number(rowEl.dataset.i);
      ['name', 'sales', 'supplier', 'ads', 'other'].forEach((role) => {
        rowEl.querySelector(`[data-role="${role}"]`).addEventListener('input', (e) => {
          b.months[i][role] = role === 'name' ? e.target.value : Number(e.target.value) || 0;
          save();
          if (role !== 'name') {
            const m = b.months[i];
            rowEl.querySelector('[data-role="profit"]').innerHTML = `<span class="dash-col-label">רווח</span>${moneyVal(m.sales - m.supplier - m.ads - m.other)}`;
            recomputeTotals();
          }
        });
      });
    });
    bodyEl.querySelector('#setaside-pct').addEventListener('input', (e) => {
      b.setAsidePct = Number(e.target.value) || 0;
      save();
      recomputeTotals();
    });
  }

  function renderActive() {
    tabBtns.forEach((btn) => {
      const on = btn.dataset.tab === activeTab;
      btn.classList.toggle('on', on);
      btn.setAttribute('aria-selected', String(on));
    });
    if (activeTab === 'personal') renderPersonal();
    else renderBusiness();
  }

  tabBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      activeTab = btn.dataset.tab;
      history.replaceState(null, '', `#/dashboard?tab=${activeTab}`);
      renderActive();
    });
  });

  root.querySelector('#dash-reset-btn').addEventListener('click', () => {
    store.resetDashboard();
    data = defaultDashboard();
    renderActive();
  });

  renderActive();
}
