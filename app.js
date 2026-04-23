// Add or remove tabs from this list to automatically hook them into the site
const sections = ['home', 'advantage', 'crisis', 'features', 'hydration', 'coc', 'efficiency', 'compliance', 'pricing', 'references', 'faq'];

// Router: Fetches HTML files from the /sections/ folder on initial load
document.addEventListener("DOMContentLoaded", async () => {
    const contentDiv = document.getElementById('main-content');

    try {
        // Fetch all section partials concurrently for maximum speed
        const fetchPromises = sections.map(sec =>
            fetch(`sections/${sec}.html`).then(r => {
                // If the file is missing or throws an error, catch it explicitly
                if (!r.ok) {
                    console.error(`Missing file: sections/${sec}.html`);
                    return `<div class="text-center py-32 text-red-500 font-bold text-2xl uppercase tracking-widest">
                        Error 404: sections/${sec}.html not found
                    </div>`;
                }
                return r.text();
            })
        );
        const htmlContents = await Promise.all(fetchPromises);

        sections.forEach((sec, index) => {
            const el = document.createElement(sec === 'home' ? 'main' : 'section');
            el.id = sec;
            el.className = 'tab-content ' + (sec === 'home' ? 'active' : '');
            el.innerHTML = htmlContents[index];
            contentDiv.appendChild(el);
        });

        // Initialize active tab based on URL hash (e.g. site.com/#crisis)
        const hash = window.location.hash.replace('#', '');
        if (hash && sections.includes(hash)) {
            switchTab(hash);
        }
    } catch (error) {
        console.error("Local CORS Error: To test locally, use VS Code Live Server.", error);
        contentDiv.innerHTML = "<div class='text-center py-32 text-red-500 font-bold'>Running locally? Browsers block local file fetching (CORS). Open this using VS Code Live Server, or host it on GitHub Pages.</div>";
    }
});

// Snappy Tab Navigation
function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active', 'text-white', 'text-emerald-400'));

    const activeTab = document.getElementById(tabId);
    if (activeTab) {
        activeTab.classList.add('active');
        window.scrollTo({ top: 0, behavior: 'instant' });
        history.replaceState(null, null, '#' + tabId);
    }

    const links = document.querySelectorAll('.nav-link');
    links.forEach(link => {
        if (link.getAttribute('onclick').includes(tabId)) {
            if (tabId === 'efficiency') {
                link.classList.add('active', 'text-emerald-400');
            } else {
                link.classList.add('active', 'text-white');
            }
        }
    });
}

// FAQ Logic
function toggleFAQ(button) {
    const answer = button.nextElementSibling;
    const icon = button.querySelector('.faq-icon');
    const isCurrentlyActive = answer.classList.contains('active');

    // Close all others
    document.querySelectorAll('.faq-answer').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.faq-icon').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.faq-title').forEach(el => el.classList.remove('text-blue-400'));

    if (!isCurrentlyActive) {
        answer.classList.add('active');
        icon.classList.add('active');
        button.querySelector('.faq-title').classList.add('text-blue-400');
    }
}

function filterFAQ() {
    const input = document.getElementById('faqSearch').value.toLowerCase();
    const items = document.querySelectorAll('.faq-item');
    let hasVisible = false;

    items.forEach(item => {
        const text = item.innerText.toLowerCase();
        if (text.includes(input)) {
            item.style.display = 'block';
            hasVisible = true;
        } else {
            item.style.display = 'none';
        }
    });
    document.getElementById('noFaqResults').style.display = hasVisible ? 'none' : 'block';
}

// Modal Logic
const modalData = {
    contact: {
        title: "Contact Executive Team",
        body: `<p class="mb-6">Ready to deploy the Hydration Engine? Contact our team to schedule a technical demo.</p>
               <div class="grid sm:grid-cols-2 gap-4">
                   ${[
                { n: 'Josh McIver', e: 'josh@mijory.com' },
                { n: 'Ryan Pacheco', e: 'ryan@mijory.com' },
                { n: 'Mike Larsen', e: 'mike@mijory.com' },
            ].map(p => `
                   <div class="p-4 bg-white/5 border border-white/10 rounded-xl">
                       <h4 class="font-bold text-white mb-1">${p.n}</h4>
                       <a href="mailto:${p.e}" class="text-blue-400 text-sm hover:underline">${p.e}</a>
                   </div>`).join('')}
               </div>`
    },
    thc: { title: "🌿 Regulated THC", body: "State-by-state compliance doesn't have to be a bottleneck. TrakPath streamlines the entire track-and-trace lifecycle by automating audits, compliance reporting, and recall readiness in real-time." },
    kratom: { title: "🍃 Kratom Supply Chain", body: "A rapidly growing, fragmented market demands verified sourcing. Provide undeniable proof of origin, processing history, and lab-tested safety to both vendors and consumers." },
    pharma: { title: "🧬 Peptides & Pharma", body: "Achieve unit-level DSCSA compliance without the architectural debt. Track temperature excursions and custody chains with mathematical certainty using our append-only provenance layer." },
    luxury: { title: "💎 Luxury Goods", body: "Defeat counterfeiting instantly. Empower buyers to verify the authentic digital birth certificate and immutable ownership history of high-end watches, fashion, and collectibles." },
    mining: { title: "⛏️ Mining & Minerals", body: "From conflict-free mineral verification to bulk ore logistics, TrakPath provides an unbreakable digital thread from the initial extraction site all the way to the final manufacturer." },
    freight: { title: "📦 High-Value Freight", body: "Eliminate blind spots in transit. Automate custody transfers and condition monitoring across disparate carriers, ensuring absolute accountability and rapid reconciliation at every handoff." }
};

function openModal(key) {
    const modalOverlay = document.getElementById('modalOverlay');
    if (modalData[key] && modalOverlay) {
        document.getElementById('modalTitle').innerHTML = modalData[key].title;
        document.getElementById('modalBody').innerHTML = modalData[key].body;
        modalOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal() {
    document.getElementById('modalOverlay').classList.remove('active');
    document.body.style.overflow = '';
}

document.addEventListener('click', (e) => {
    const modalOverlay = document.getElementById('modalOverlay');
    if (e.target === modalOverlay) closeModal();
});

window.copyEmailToClipboard = function(btn, email) {
    navigator.clipboard.writeText(email).then(() => {
        const originalHTML = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-check-circle text-emerald-400"></i> Copied';
        setTimeout(() => { btn.innerHTML = originalHTML; }, 2000);
    }).catch(err => {
        console.error('Failed to copy email: ', err);
    });
};