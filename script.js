/* Custom Cursor */
(function initCursor() {
	const dot   = document.getElementById('cursor');
	const trail = document.getElementById('cursor-trail');
	if (!dot || !trail) return;

	let mx = -100, my = -100;
	let tx = -100, ty = -100;

	document.addEventListener('mousemove', e => {
		mx = e.clientX;
		my = e.clientY;
		dot.style.left = mx + 'px';
		dot.style.top  = my + 'px';
	});

	function animateTrail() {
		tx += (mx - tx) * 0.18;
		ty += (my - ty) * 0.18;
		trail.style.left = tx + 'px';
		trail.style.top  = ty + 'px';
		requestAnimationFrame(animateTrail);
	}
	animateTrail();

	document.addEventListener('mouseleave', () => {
		dot.style.opacity   = '0';
		trail.style.opacity = '0';
	});
	document.addEventListener('mouseenter', () => {
		dot.style.opacity   = '1';
		trail.style.opacity = '1';
	});
})();

/* Language Toggle  */
(function initLang() {
	const html      = document.documentElement;
	const btn       = document.getElementById('lang-toggle');
	const label     = document.getElementById('lang-label');
	if (!btn) return;

	const STRINGS = {
		en: { label: '中文', attr: 'data-en' },
		cn: { label: 'EN',   attr: 'data-cn' },
	};

	function applyLang(lang) {
		html.dataset.lang = lang;
		html.lang = lang === 'cn' ? 'zh-CN' : 'en';
		label.textContent = STRINGS[lang].label;

		const attr = STRINGS[lang].attr;
		document.querySelectorAll('[data-en]').forEach(el => {
			const val = el.getAttribute(attr);
			if (val !== null) el.textContent = val;
		});

		localStorage.setItem('portfolio-lang', lang);
	}

	btn.addEventListener('click', () => {
		const next = html.dataset.lang === 'en' ? 'cn' : 'en';
		applyLang(next);
		/* Re-run typewriter in new language */
		restartTypewriter(next);
	});

	/* Restore saved preference */
	const saved = localStorage.getItem('portfolio-lang');
	if (saved && saved !== 'en') {
		applyLang(saved);
	} else {
		applyLang('en');
	}
})();

/*  Typewriter Effect */
const ROLES = {
	en: [
		'Software Engineering Intern',
		'Security Research Intern',
		'Full-Stack Developer',
		'LLM Security Researcher',
	],
	cn: [
		'软件工程 实习生',
		'信息安全 实习生',
		'全栈开发工程师',
		'大模型安全研究员',
	],
};

let twTimer    = null;
let twIndex    = 0;
let twCharIdx  = 0;
let twDeleting = false;
let twPaused   = false;

function typewriterTick(lang) {
	const el = document.getElementById('typewriter');
	if (!el) return;

	const phrases = ROLES[lang] || ROLES.en;
	const phrase  = phrases[twIndex % phrases.length];

	if (twPaused) {
		twPaused = false;
		twDeleting = true;
		twTimer = setTimeout(() => typewriterTick(lang), 80);
		return;
	}

	if (!twDeleting) {
		el.textContent = phrase.slice(0, ++twCharIdx);
		if (twCharIdx >= phrase.length) {
			twPaused = true;
			twTimer = setTimeout(() => typewriterTick(lang), 1800);
			return;
		}
		twTimer = setTimeout(() => typewriterTick(lang), 68);
	} else {
		el.textContent = phrase.slice(0, --twCharIdx);
		if (twCharIdx === 0) {
			twDeleting = false;
			twIndex++;
			twTimer = setTimeout(() => typewriterTick(lang), 320);
			return;
		}
		twTimer = setTimeout(() => typewriterTick(lang), 38);
	}
}

function restartTypewriter(lang) {
	clearTimeout(twTimer);
	twCharIdx  = 0;
	twDeleting = false;
	twPaused   = false;
	const el = document.getElementById('typewriter');
	if (el) el.textContent = '';
	twTimer = setTimeout(() => typewriterTick(lang), 400);
}

/* Start typewriter after page load */
window.addEventListener('DOMContentLoaded', () => {
	const lang = document.documentElement.dataset.lang || 'en';
	twTimer = setTimeout(() => typewriterTick(lang), 800);
});

/*  Live Clock */
(function initClock() {
	const el = document.getElementById('clock');
	if (!el) return;

	function updateClock() {
		const now = new Date();
		/* CST = UTC + 8 hours */
		const cst = new Date(now.getTime() + (8 * 60 * 60 * 1000));
		const hh  = String(cst.getUTCHours()).padStart(2, '0');
		const mm  = String(cst.getUTCMinutes()).padStart(2, '0');
		const ss  = String(cst.getUTCSeconds()).padStart(2, '0');
		el.textContent = `${hh}:${mm}:${ss}`;
	}

	updateClock();
	setInterval(updateClock, 1000);
})();

/* Scroll Reveal (IntersectionObserver) */
(function initReveal() {
	const observer = new IntersectionObserver(entries => {
		entries.forEach(entry => {
			if (entry.isIntersecting) {
				entry.target.classList.add('revealed');
				observer.unobserve(entry.target);
			}
		});
	}, {
		threshold: 0.08,
		rootMargin: '0px 0px -40px 0px',
	});

	document.querySelectorAll('.reveal').forEach((el, i) => {
		el.style.transitionDelay = `${Math.min(i * 0.04, 0.3)}s`;
		observer.observe(el);
	});
})();

/* Nav: active section highlight */
(function initNavHighlight() {
	const sections = document.querySelectorAll('section[id]');
	const links    = document.querySelectorAll('.nav-links a');

	function onScroll() {
		let current = '';
		sections.forEach(sec => {
			if (window.scrollY >= sec.offsetTop - 100) current = sec.id;
		});
		links.forEach(a => {
			a.style.color = a.getAttribute('href') === '#' + current
				? 'var(--text)'
				: '';
		});
	}

	window.addEventListener('scroll', onScroll, { passive: true });
	onScroll();
})();

/* Nav: collapse on scroll + mobile toggle */
(function initNav() {
	const nav    = document.getElementById('nav');
	const toggle = document.getElementById('nav-toggle');
	const links  = document.getElementById('nav-links');
	if (!nav || !toggle || !links) return;

	toggle.addEventListener('click', () => {
		links.classList.toggle('open');
		toggle.setAttribute('aria-expanded', links.classList.contains('open'));
	});

	/* Close mobile nav on link click */
	links.querySelectorAll('a').forEach(a => {
		a.addEventListener('click', () => links.classList.remove('open'));
	});

	/* Nav shadow on scroll */
	window.addEventListener('scroll', () => {
		nav.style.boxShadow = window.scrollY > 10
			? '0 1px 24px rgba(0,0,0,0.5)'
			: '';
	}, { passive: true });
})();

/* Skill tags */
(function initSkillStagger() {
	document.querySelectorAll('.skills-block').forEach(block => {
		const obs = new IntersectionObserver(entries => {
			entries.forEach(entry => {
				if (entry.isIntersecting) {
					const tags = block.querySelectorAll('.skill-tag');
					tags.forEach((tag, i) => {
						setTimeout(() => {
							tag.style.opacity = '1';
							tag.style.transform = 'translateY(0)';
						}, i * 40);
					});
					obs.unobserve(block);
				}
			});
		}, { threshold: 0.2 });

		/* Set initial state */
		block.querySelectorAll('.skill-tag').forEach(tag => {
			tag.style.opacity    = '0';
			tag.style.transform  = 'translateY(6px)';
			tag.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
		});

		obs.observe(block);
	});
})();
