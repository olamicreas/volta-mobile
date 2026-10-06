document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('drafts-container');
    const clearBtn = document.getElementById('clear-btn');

    // Fetch ALL drafts, ignoring the hostname filter so we can see everything
    chrome.storage.local.get(null, (items) => {
        const allDrafts = Object.entries(items).filter(([key]) => key.startsWith('draft_'));

        if (allDrafts.length === 0) {
            container.innerHTML = '<div id="empty-state">No drafts captured yet. Try typing again.</div>';
            clearBtn.style.display = 'none';
            return;
        }

        container.innerHTML = ''; // Clear existing content

        allDrafts.forEach(([key, value]) => {
            // Remove 'draft_' for display purposes
            const displayName = key.replace('draft_', '');
            const div = document.createElement('div');
            div.className = 'draft-item';
            div.innerHTML = `
                <div class="field-name">${displayName}</div>
                <div class="field-value">${value || '(empty)'}</div>
            `;
            container.appendChild(div);
        });

        clearBtn.style.display = 'block'; // Show clear button if there are drafts
    });

    clearBtn.addEventListener('click', () => {
        chrome.storage.local.clear(() => {
            container.innerHTML = '<div id="empty-state">All drafts cleared.</div>';
            clearBtn.style.display = 'none';
        });
    });
});