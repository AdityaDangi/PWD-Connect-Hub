const API = 'http://localhost:3000/api';

// ── Navigation ──────────────────────────────────────────────────
function navigate(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById('page-' + page).classList.add('active');
  document.querySelector(`[data-page="${page}"]`).classList.add('active');
  document.getElementById('page-title').textContent = page.charAt(0).toUpperCase() + page.slice(1);
  loadPage(page);
}

document.querySelectorAll('.nav-item').forEach(btn => {
  btn.addEventListener('click', () => navigate(btn.dataset.page));
});

function loadPage(page) {
  if (page === 'dashboard')   loadDashboard();
  if (page === 'projects')    loadProjects();
  if (page === 'contractors') loadContractors();
  if (page === 'labor')       loadLabor();
  if (page === 'materials')   loadMaterials();
  if (page === 'pricing')     loadPricing();
  if (page === 'payments')    loadPayments();
}

// ── Toast ────────────────────────────────────────────────────────
function toast(msg, type = 'success') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = `show ${type}`;
  setTimeout(() => t.className = '', 3000);
}

// ── Modal ────────────────────────────────────────────────────────
function openModal(name) {
  document.getElementById('modal-' + name).classList.add('open');
}
function closeModal(name) {
  document.getElementById('modal-' + name).classList.remove('open');
}
// Close on overlay click
document.querySelectorAll('.modal-overlay').forEach(o => {
  o.addEventListener('click', e => { if (e.target === o) o.classList.remove('open'); });
});

// ── Confirm Delete ───────────────────────────────────────────────
function confirmDelete(fn) {
  openModal('confirm');
  document.getElementById('confirm-delete-btn').onclick = () => { closeModal('confirm'); fn(); };
}

// ── Table Filter ─────────────────────────────────────────────────
function filterTable(tableId, query) {
  const q = query.toLowerCase();
  document.querySelectorAll(`#${tableId} tbody tr`).forEach(tr => {
    tr.style.display = tr.textContent.toLowerCase().includes(q) ? '' : 'none';
  });
}

// ── Helpers ──────────────────────────────────────────────────────
const fmt = n => '₹' + Number(n||0).toLocaleString('en-IN');
const stars = r => '★'.repeat(Math.round(r||0)) + '☆'.repeat(5 - Math.round(r||0));

function statusBadge(s) {
  const map = {
    'Active':'badge-green','Completed':'badge-blue','On Hold':'badge-yellow',
    'Cancelled':'badge-red','Available':'badge-green','On Site':'badge-blue',
    'Inactive':'badge-gray','In Stock':'badge-green','Low Stock':'badge-yellow',
    'Out of Stock':'badge-red','Paid':'badge-green','Pending':'badge-yellow',
    'Material':'badge-blue','Labor':'badge-green','Equipment':'badge-purple','Service':'badge-gray'
  };
  return `<span class="badge ${map[s]||'badge-gray'}">${s}</span>`;
}

async function fetchProjects() {
  const r = await fetch(`${API}/projects`); return r.json();
}

// ── DASHBOARD ────────────────────────────────────────────────────
async function loadDashboard() {
  const d = await (await fetch(`${API}/dashboard`)).json();
  document.getElementById('ds-projects').textContent    = d.projects.active || 0;
  document.getElementById('ds-labor').textContent       = d.labor.c || 0;
  document.getElementById('ds-materials').textContent   = d.materials.c || 0;
  document.getElementById('ds-contractors').textContent = d.contractors.c || 0;
  document.getElementById('ds-paid').textContent    = fmt(d.payments.paid);
  document.getElementById('ds-pending').textContent = fmt(d.payments.pending);

  const actEl = document.getElementById('dash-activity');
  if (!d.recentActivity.length) { actEl.innerHTML = '<div class="empty-state"><div class="empty-icon">📭</div><p>No recent activity</p></div>'; return; }
  const icons = { contractor:'👷', material:'🧱', project:'📁' };
  actEl.innerHTML = d.recentActivity.map(a => `
    <div class="activity-item">
      <div class="activity-dot icon-blue">${icons[a.type]||'📌'}</div>
      <div><div class="activity-title">${a.title}</div><div class="activity-time">${new Date(a.created_at).toLocaleString('en-IN')}</div></div>
    </div>`).join('');
}

// ── PROJECTS ─────────────────────────────────────────────────────
async function loadProjects() {
  const rows = await (await fetch(`${API}/projects`)).json();
  const tbody = document.getElementById('projects-tbody');
  if (!rows.length) { tbody.innerHTML = '<tr><td colspan="10"><div class="empty-state"><div class="empty-icon">📁</div><p>No projects yet. Add your first project!</p></div></td></tr>'; return; }
  tbody.innerHTML = rows.map(r => {
    const pct = r.budget > 0 ? Math.min(100, Math.round((r.spent / r.budget) * 100)) : 0;
    return `<tr>
      <td>${r.id}</td>
      <td><strong>${r.name}</strong>${r.description ? `<br><small style="color:var(--muted)">${r.description.substring(0,40)}...</small>` : ''}</td>
      <td>${r.location||'—'}</td>
      <td>${r.contractor_name||'—'}</td>
      <td>${fmt(r.budget)}</td>
      <td>${fmt(r.spent)}</td>
      <td style="min-width:100px">
        <div style="font-size:0.7rem;margin-bottom:3px">${pct}%</div>
        <div class="progress-wrap"><div class="progress-bar" style="width:${pct}%;background:${pct>80?'var(--red)':pct>50?'var(--yellow)':'var(--primary)'}"></div></div>
      </td>
      <td>${statusBadge(r.status)}</td>
      <td style="font-size:0.72rem">${r.start_date||'—'}<br>${r.end_date||'—'}</td>
      <td>
        <button class="btn btn-outline btn-sm btn-icon" onclick="editProject(${r.id})" title="Edit">✏️</button>
        <button class="btn btn-danger btn-sm btn-icon" onclick="deleteProject(${r.id})" title="Delete">🗑️</button>
      </td>
    </tr>`;
  }).join('');
}

async function openModal_project_with_contractors() {
  const contractors = await (await fetch(`${API}/contractors`)).json();
  const sel = document.getElementById('project-contractor');
  sel.innerHTML = '<option value="">-- Select Contractor --</option>' +
    contractors.filter(c => c.status === 'Active').map(c => `<option value="${c.id}">${c.name}</option>`).join('');
}

function openModal(name) {
  if (name === 'project') openModal_project_with_contractors();
  if (name === 'labor' || name === 'material' || name === 'payment') loadProjectsIntoSelect(name);
  document.getElementById('modal-' + name).classList.add('open');
}

async function loadProjectsIntoSelect(type) {
  const projects = await fetchProjects();
  const opts = '<option value="">-- Not Assigned --</option>' + projects.map(p => `<option value="${p.id}">${p.name}</option>`).join('');
  if (type === 'labor')    document.getElementById('labor-project').innerHTML = opts;
  if (type === 'material') document.getElementById('material-project').innerHTML = opts;
  if (type === 'payment')  document.getElementById('payment-project').innerHTML = '<option value="">-- Not linked --</option>' + projects.map(p => `<option value="${p.id}">${p.name}</option>`).join('');
}

function resetProjectForm() {
  ['project-id','project-name','project-location','project-budget','project-spent','project-start','project-end','project-desc'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('project-status').value = 'Active';
  document.getElementById('project-modal-title').textContent = 'New Project';
}

async function editProject(id) {
  await openModal_project_with_contractors();
  const r = await (await fetch(`${API}/projects/${id}`)).json();
  document.getElementById('project-id').value       = r.id;
  document.getElementById('project-name').value     = r.name;
  document.getElementById('project-location').value = r.location||'';
  document.getElementById('project-status').value   = r.status;
  document.getElementById('project-budget').value   = r.budget;
  document.getElementById('project-spent').value    = r.spent;
  document.getElementById('project-start').value    = r.start_date||'';
  document.getElementById('project-end').value      = r.end_date||'';
  document.getElementById('project-contractor').value = r.contractor_id||'';
  document.getElementById('project-desc').value     = r.description||'';
  document.getElementById('project-modal-title').textContent = 'Edit Project';
  document.getElementById('modal-project').classList.add('open');
}

async function saveProject() {
  const id = document.getElementById('project-id').value;
  const body = {
    name: document.getElementById('project-name').value.trim(),
    location: document.getElementById('project-location').value,
    status: document.getElementById('project-status').value,
    budget: document.getElementById('project-budget').value,
    spent: document.getElementById('project-spent').value,
    start_date: document.getElementById('project-start').value,
    end_date: document.getElementById('project-end').value,
    contractor_id: document.getElementById('project-contractor').value || null,
    description: document.getElementById('project-desc').value,
  };
  if (!body.name) { toast('Project name is required', 'error'); return; }
  const url = id ? `${API}/projects/${id}` : `${API}/projects`;
  const method = id ? 'PUT' : 'POST';
  const res = await fetch(url, { method, headers: {'Content-Type':'application/json'}, body: JSON.stringify(body) });
  if (res.ok) { toast(id ? 'Project updated!' : 'Project created!'); closeModal('project'); resetProjectForm(); loadProjects(); loadDashboard(); }
  else { const e = await res.json(); toast(e.error || 'Error', 'error'); }
}

function deleteProject(id) {
  confirmDelete(async () => {
    await fetch(`${API}/projects/${id}`, { method: 'DELETE' });
    toast('Project deleted'); loadProjects(); loadDashboard();
  });
}

// ── CONTRACTORS ──────────────────────────────────────────────────
async function loadContractors() {
  const rows = await (await fetch(`${API}/contractors`)).json();
  const tbody = document.getElementById('contractors-tbody');
  if (!rows.length) { tbody.innerHTML = '<tr><td colspan="10"><div class="empty-state"><div class="empty-icon">👷</div><p>No contractors yet.</p></div></td></tr>'; return; }
  tbody.innerHTML = rows.map(r => `<tr>
    <td>${r.id}</td>
    <td><strong>${r.name}</strong></td>
    <td>${r.phone||'—'}</td>
    <td>${r.email||'—'}</td>
    <td>${r.specialization||'—'}</td>
    <td><code style="font-size:0.72rem">${r.license_no||'—'}</code></td>
    <td><span class="stars">${stars(r.rating)}</span> <small>${r.rating||0}</small></td>
    <td style="text-align:center">${r.projects_completed||0}</td>
    <td>${statusBadge(r.status)}</td>
    <td>
      <button class="btn btn-outline btn-sm btn-icon" onclick="editContractor(${r.id})">✏️</button>
      <button class="btn btn-danger btn-sm btn-icon" onclick="deleteContractor(${r.id})">🗑️</button>
    </td>
  </tr>`).join('');
}

function resetContractorForm() {
  ['contractor-id','contractor-name','contractor-phone','contractor-email','contractor-spec','contractor-license','contractor-rating','contractor-projects','contractor-address'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('contractor-status').value = 'Active';
  document.getElementById('contractor-modal-title').textContent = 'Add Contractor';
}

async function editContractor(id) {
  const r = await (await fetch(`${API}/contractors/${id}`)).json();
  document.getElementById('contractor-id').value       = r.id;
  document.getElementById('contractor-name').value     = r.name;
  document.getElementById('contractor-phone').value    = r.phone||'';
  document.getElementById('contractor-email').value    = r.email||'';
  document.getElementById('contractor-spec').value     = r.specialization||'';
  document.getElementById('contractor-license').value  = r.license_no||'';
  document.getElementById('contractor-rating').value   = r.rating||0;
  document.getElementById('contractor-projects').value = r.projects_completed||0;
  document.getElementById('contractor-status').value   = r.status;
  document.getElementById('contractor-address').value  = r.address||'';
  document.getElementById('contractor-modal-title').textContent = 'Edit Contractor';
  document.getElementById('modal-contractor').classList.add('open');
}

async function saveContractor() {
  const id = document.getElementById('contractor-id').value;
  const body = {
    name: document.getElementById('contractor-name').value.trim(),
    phone: document.getElementById('contractor-phone').value,
    email: document.getElementById('contractor-email').value,
    specialization: document.getElementById('contractor-spec').value,
    license_no: document.getElementById('contractor-license').value,
    rating: document.getElementById('contractor-rating').value,
    projects_completed: document.getElementById('contractor-projects').value,
    status: document.getElementById('contractor-status').value,
    address: document.getElementById('contractor-address').value,
  };
  if (!body.name) { toast('Name is required', 'error'); return; }
  const url = id ? `${API}/contractors/${id}` : `${API}/contractors`;
  const method = id ? 'PUT' : 'POST';
  const res = await fetch(url, { method, headers: {'Content-Type':'application/json'}, body: JSON.stringify(body) });
  if (res.ok) { toast(id ? 'Contractor updated!' : 'Contractor added!'); closeModal('contractor'); resetContractorForm(); loadContractors(); loadDashboard(); }
  else { const e = await res.json(); toast(e.error || 'Error', 'error'); }
}

function deleteContractor(id) {
  confirmDelete(async () => {
    await fetch(`${API}/contractors/${id}`, { method: 'DELETE' });
    toast('Contractor deleted'); loadContractors(); loadDashboard();
  });
}

// ── LABOR ────────────────────────────────────────────────────────
async function loadLabor() {
  const rows = await (await fetch(`${API}/labor`)).json();
  const tbody = document.getElementById('labor-tbody');
  if (!rows.length) { tbody.innerHTML = '<tr><td colspan="10"><div class="empty-state"><div class="empty-icon">🦺</div><p>No labor records yet.</p></div></td></tr>'; return; }
  tbody.innerHTML = rows.map(r => `<tr>
    <td>${r.id}</td>
    <td><strong>${r.name}</strong></td>
    <td>${r.phone||'—'}</td>
    <td>${r.skill||'—'}</td>
    <td>${fmt(r.daily_rate)}/day</td>
    <td><code style="font-size:0.72rem">${r.aadhar_no||'—'}</code></td>
    <td style="font-size:0.75rem">${r.address||'—'}</td>
    <td>${r.project_name||'—'}</td>
    <td>${statusBadge(r.status)}</td>
    <td>
      <button class="btn btn-outline btn-sm btn-icon" onclick="editLabor(${r.id})">✏️</button>
      <button class="btn btn-danger btn-sm btn-icon" onclick="deleteLabor(${r.id})">🗑️</button>
    </td>
  </tr>`).join('');
}

function resetLaborForm() {
  ['labor-id','labor-name','labor-phone','labor-skill','labor-rate','labor-aadhar','labor-address'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('labor-status').value = 'Available';
  document.getElementById('labor-modal-title').textContent = 'Add Labor';
}

async function editLabor(id) {
  await loadProjectsIntoSelect('labor');
  const r = await (await fetch(`${API}/labor/${id}`)).json();
  document.getElementById('labor-id').value      = r.id;
  document.getElementById('labor-name').value    = r.name;
  document.getElementById('labor-phone').value   = r.phone||'';
  document.getElementById('labor-skill').value   = r.skill||'';
  document.getElementById('labor-rate').value    = r.daily_rate||0;
  document.getElementById('labor-aadhar').value  = r.aadhar_no||'';
  document.getElementById('labor-status').value  = r.status;
  document.getElementById('labor-project').value = r.project_id||'';
  document.getElementById('labor-address').value = r.address||'';
  document.getElementById('labor-modal-title').textContent = 'Edit Labor';
  document.getElementById('modal-labor').classList.add('open');
}

async function saveLabor() {
  const id = document.getElementById('labor-id').value;
  const body = {
    name: document.getElementById('labor-name').value.trim(),
    phone: document.getElementById('labor-phone').value,
    skill: document.getElementById('labor-skill').value,
    daily_rate: document.getElementById('labor-rate').value,
    aadhar_no: document.getElementById('labor-aadhar').value,
    status: document.getElementById('labor-status').value,
    project_id: document.getElementById('labor-project').value || null,
    address: document.getElementById('labor-address').value,
  };
  if (!body.name) { toast('Name is required', 'error'); return; }
  const url = id ? `${API}/labor/${id}` : `${API}/labor`;
  const method = id ? 'PUT' : 'POST';
  const res = await fetch(url, { method, headers: {'Content-Type':'application/json'}, body: JSON.stringify(body) });
  if (res.ok) { toast(id ? 'Labor updated!' : 'Labor added!'); closeModal('labor'); resetLaborForm(); loadLabor(); loadDashboard(); }
  else { const e = await res.json(); toast(e.error || 'Error', 'error'); }
}

function deleteLabor(id) {
  confirmDelete(async () => {
    await fetch(`${API}/labor/${id}`, { method: 'DELETE' });
    toast('Labor record deleted'); loadLabor(); loadDashboard();
  });
}

// ── MATERIALS ────────────────────────────────────────────────────
async function loadMaterials() {
  const rows = await (await fetch(`${API}/materials`)).json();
  const tbody = document.getElementById('materials-tbody');
  if (!rows.length) { tbody.innerHTML = '<tr><td colspan="11"><div class="empty-state"><div class="empty-icon">🧱</div><p>No materials yet.</p></div></td></tr>'; return; }
  tbody.innerHTML = rows.map(r => `<tr>
    <td>${r.id}</td>
    <td><strong>${r.name}</strong></td>
    <td>${r.category||'—'}</td>
    <td>${r.unit||'—'}</td>
    <td>${r.quantity||0}</td>
    <td>${fmt(r.unit_price)}</td>
    <td>${fmt((r.quantity||0) * (r.unit_price||0))}</td>
    <td>${r.supplier||'—'}</td>
    <td>${r.project_name||'—'}</td>
    <td>${statusBadge(r.status)}</td>
    <td>
      <button class="btn btn-outline btn-sm btn-icon" onclick="editMaterial(${r.id})">✏️</button>
      <button class="btn btn-danger btn-sm btn-icon" onclick="deleteMaterial(${r.id})">🗑️</button>
    </td>
  </tr>`).join('');
}

function resetMaterialForm() {
  ['material-id','material-name','material-category','material-unit','material-qty','material-price','material-supplier'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('material-status').value = 'In Stock';
  document.getElementById('material-modal-title').textContent = 'Add Material';
}

async function editMaterial(id) {
  await loadProjectsIntoSelect('material');
  const r = await (await fetch(`${API}/materials/${id}`)).json();
  document.getElementById('material-id').value       = r.id;
  document.getElementById('material-name').value     = r.name;
  document.getElementById('material-category').value = r.category||'';
  document.getElementById('material-unit').value     = r.unit||'';
  document.getElementById('material-qty').value      = r.quantity||0;
  document.getElementById('material-price').value    = r.unit_price||0;
  document.getElementById('material-supplier').value = r.supplier||'';
  document.getElementById('material-status').value   = r.status;
  document.getElementById('material-project').value  = r.project_id||'';
  document.getElementById('material-modal-title').textContent = 'Edit Material';
  document.getElementById('modal-material').classList.add('open');
}

async function saveMaterial() {
  const id = document.getElementById('material-id').value;
  const body = {
    name: document.getElementById('material-name').value.trim(),
    category: document.getElementById('material-category').value,
    unit: document.getElementById('material-unit').value,
    quantity: document.getElementById('material-qty').value,
    unit_price: document.getElementById('material-price').value,
    supplier: document.getElementById('material-supplier').value,
    status: document.getElementById('material-status').value,
    project_id: document.getElementById('material-project').value || null,
  };
  if (!body.name) { toast('Name is required', 'error'); return; }
  const url = id ? `${API}/materials/${id}` : `${API}/materials`;
  const method = id ? 'PUT' : 'POST';
  const res = await fetch(url, { method, headers: {'Content-Type':'application/json'}, body: JSON.stringify(body) });
  if (res.ok) { toast(id ? 'Material updated!' : 'Material added!'); closeModal('material'); resetMaterialForm(); loadMaterials(); }
  else { const e = await res.json(); toast(e.error || 'Error', 'error'); }
}

function deleteMaterial(id) {
  confirmDelete(async () => {
    await fetch(`${API}/materials/${id}`, { method: 'DELETE' });
    toast('Material deleted'); loadMaterials();
  });
}

// ── PRICING ──────────────────────────────────────────────────────
async function loadPricing() {
  const rows = await (await fetch(`${API}/pricing`)).json();
  const tbody = document.getElementById('pricing-tbody');
  if (!rows.length) { tbody.innerHTML = '<tr><td colspan="10"><div class="empty-state"><div class="empty-icon">💰</div><p>No pricing rates yet.</p></div></td></tr>'; return; }
  tbody.innerHTML = rows.map(r => {
    const withGst = (r.rate * (1 + (r.gst_percent||0)/100)).toFixed(2);
    return `<tr>
      <td>${r.id}</td>
      <td><strong>${r.item_name}</strong></td>
      <td>${statusBadge(r.category||'Material')}</td>
      <td>${r.unit||'—'}</td>
      <td>${fmt(r.rate)}</td>
      <td>${r.gst_percent||0}%</td>
      <td><strong>${fmt(withGst)}</strong></td>
      <td>${r.effective_date||'—'}</td>
      <td style="font-size:0.75rem;color:var(--muted)">${r.description||'—'}</td>
      <td>
        <button class="btn btn-outline btn-sm btn-icon" onclick="editPricing(${r.id})">✏️</button>
        <button class="btn btn-danger btn-sm btn-icon" onclick="deletePricing(${r.id})">🗑️</button>
      </td>
    </tr>`;
  }).join('');
}

function resetPricingForm() {
  ['pricing-id','pricing-name','pricing-unit','pricing-rate','pricing-gst','pricing-date','pricing-desc'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('pricing-category').value = 'Material';
  document.getElementById('pricing-modal-title').textContent = 'Add Rate';
}

async function editPricing(id) {
  const r = await (await fetch(`${API}/pricing/${id}`)).json();
  document.getElementById('pricing-id').value       = r.id;
  document.getElementById('pricing-name').value     = r.item_name;
  document.getElementById('pricing-category').value = r.category||'Material';
  document.getElementById('pricing-unit').value     = r.unit||'';
  document.getElementById('pricing-rate').value     = r.rate||0;
  document.getElementById('pricing-gst').value      = r.gst_percent||18;
  document.getElementById('pricing-date').value     = r.effective_date||'';
  document.getElementById('pricing-desc').value     = r.description||'';
  document.getElementById('pricing-modal-title').textContent = 'Edit Rate';
  document.getElementById('modal-pricing').classList.add('open');
}

async function savePricing() {
  const id = document.getElementById('pricing-id').value;
  const body = {
    item_name: document.getElementById('pricing-name').value.trim(),
    category: document.getElementById('pricing-category').value,
    unit: document.getElementById('pricing-unit').value,
    rate: document.getElementById('pricing-rate').value,
    gst_percent: document.getElementById('pricing-gst').value,
    effective_date: document.getElementById('pricing-date').value,
    description: document.getElementById('pricing-desc').value,
  };
  if (!body.item_name) { toast('Item name is required', 'error'); return; }
  const url = id ? `${API}/pricing/${id}` : `${API}/pricing`;
  const method = id ? 'PUT' : 'POST';
  const res = await fetch(url, { method, headers: {'Content-Type':'application/json'}, body: JSON.stringify(body) });
  if (res.ok) { toast(id ? 'Rate updated!' : 'Rate added!'); closeModal('pricing'); resetPricingForm(); loadPricing(); }
  else { const e = await res.json(); toast(e.error || 'Error', 'error'); }
}

function deletePricing(id) {
  confirmDelete(async () => {
    await fetch(`${API}/pricing/${id}`, { method: 'DELETE' });
    toast('Rate deleted'); loadPricing();
  });
}

// ── PAYMENTS ─────────────────────────────────────────────────────
async function loadPayments() {
  const [rows, stats] = await Promise.all([
    (await fetch(`${API}/payments`)).json(),
    (await fetch(`${API}/payments/stats/summary`)).json()
  ]);
  document.getElementById('pay-total').textContent   = fmt(stats.total);
  document.getElementById('pay-paid').textContent    = fmt(stats.paid);
  document.getElementById('pay-pending').textContent = fmt(stats.pending);
  document.getElementById('pay-count').textContent   = stats.count || 0;

  const tbody = document.getElementById('payments-tbody');
  if (!rows.length) { tbody.innerHTML = '<tr><td colspan="11"><div class="empty-state"><div class="empty-icon">💳</div><p>No payment records yet.</p></div></td></tr>'; return; }
  tbody.innerHTML = rows.map(r => `<tr>
    <td>${r.id}</td>
    <td><code style="font-size:0.72rem">${r.reference_no||'—'}</code></td>
    <td>${r.type||'—'}</td>
    <td><strong>${r.party_name}</strong></td>
    <td>${r.project_name||'—'}</td>
    <td><strong>${fmt(r.amount)}</strong></td>
    <td>${r.payment_mode||'—'}</td>
    <td>${r.payment_date||'—'}</td>
    <td>${statusBadge(r.status)}</td>
    <td style="font-size:0.75rem;color:var(--muted)">${r.notes||'—'}</td>
    <td>
      <button class="btn btn-outline btn-sm btn-icon" onclick="editPayment(${r.id})">✏️</button>
      <button class="btn btn-danger btn-sm btn-icon" onclick="deletePayment(${r.id})">🗑️</button>
    </td>
  </tr>`).join('');
}

function resetPaymentForm() {
  ['payment-id','payment-ref','payment-party','payment-amount','payment-date','payment-notes'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('payment-type').value   = 'Contractor Payment';
  document.getElementById('payment-mode').value   = 'Bank Transfer';
  document.getElementById('payment-status').value = 'Pending';
  document.getElementById('payment-modal-title').textContent = 'Record Payment';
}

async function editPayment(id) {
  await loadProjectsIntoSelect('payment');
  const r = await (await fetch(`${API}/payments/${id}`)).json();
  document.getElementById('payment-id').value      = r.id;
  document.getElementById('payment-ref').value     = r.reference_no||'';
  document.getElementById('payment-type').value    = r.type||'Contractor Payment';
  document.getElementById('payment-party').value   = r.party_name;
  document.getElementById('payment-amount').value  = r.amount||0;
  document.getElementById('payment-mode').value    = r.payment_mode||'Bank Transfer';
  document.getElementById('payment-date').value    = r.payment_date||'';
  document.getElementById('payment-status').value  = r.status;
  document.getElementById('payment-project').value = r.project_id||'';
  document.getElementById('payment-notes').value   = r.notes||'';
  document.getElementById('payment-modal-title').textContent = 'Edit Payment';
  document.getElementById('modal-payment').classList.add('open');
}

async function savePayment() {
  const id = document.getElementById('payment-id').value;
  const body = {
    reference_no: document.getElementById('payment-ref').value,
    type: document.getElementById('payment-type').value,
    party_name: document.getElementById('payment-party').value.trim(),
    amount: document.getElementById('payment-amount').value,
    payment_mode: document.getElementById('payment-mode').value,
    payment_date: document.getElementById('payment-date').value,
    status: document.getElementById('payment-status').value,
    project_id: document.getElementById('payment-project').value || null,
    notes: document.getElementById('payment-notes').value,
  };
  if (!body.party_name) { toast('Party name is required', 'error'); return; }
  const url = id ? `${API}/payments/${id}` : `${API}/payments`;
  const method = id ? 'PUT' : 'POST';
  const res = await fetch(url, { method, headers: {'Content-Type':'application/json'}, body: JSON.stringify(body) });
  if (res.ok) { toast(id ? 'Payment updated!' : 'Payment recorded!'); closeModal('payment'); resetPaymentForm(); loadPayments(); loadDashboard(); }
  else { const e = await res.json(); toast(e.error || 'Error', 'error'); }
}

function deletePayment(id) {
  confirmDelete(async () => {
    await fetch(`${API}/payments/${id}`, { method: 'DELETE' });
    toast('Payment deleted'); loadPayments(); loadDashboard();
  });
}

// ── INIT ─────────────────────────────────────────────────────────
loadDashboard();
