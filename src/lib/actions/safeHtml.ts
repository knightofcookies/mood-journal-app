import DOMPurify from 'dompurify';
import { browser } from '$app/environment';

// Svelte action to safely set innerHTML with sanitization
export function safeHtml(node: HTMLElement, html: string) {
	function set(htmlValue: string) {
		const sanitized = browser
			? DOMPurify.sanitize(htmlValue, {
					ADD_TAGS: ['audio', 'source'],
					ADD_ATTR: ['controls', 'src']
				})
			: htmlValue;
		node.innerHTML = sanitized ?? '';
	}

	set(html ?? '');

	return {
		update(value: string) {
			set(value ?? '');
		},
		destroy() {
			node.innerHTML = '';
		}
	};
}

export type SafeHtmlAction = typeof safeHtml;
