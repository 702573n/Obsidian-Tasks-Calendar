import { App, Plugin, MarkdownView } from 'obsidian';
import Calendar from 'src/Calendar';

export default class TasksCalendar extends Plugin {
	app: App;

	async onload() {
		this.registerMarkdownCodeBlockProcessor("Calendar", (source, el, ctx) => {
			// Parse the source to extract parameters
				const lines = source.split('\n');
				const input: {[name: string]: string} = {};
				const regex = /^\s*(\w+)\s*:\s*(.*)$/;
				lines.forEach(line => {
					const match = line.match(regex);
					if (match) {
						const key = match[1].trim();
						const value = match[2].trim();
						input[key] = value;
					}
				});
				el.parentElement?.classList.remove('markdown-rendered');
			// Create a new Calendar instance and call displayCalendar
			new Calendar(this.app).displayCalendar(input, el.createEl('div'));
		});
		this.addCommand({
			id: 'create-calendar',
			name: 'Create Calendar',
			callback: () => {
				const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
				if (activeView) {
					const editor = activeView.editor;
					const cursor = editor.getCursor();
					editor.replaceRange(
						`\`\`\`Calendar
						pages: ""
						view: month
						firstDayOfWeek: 1
						options: style1
						\`\`\``.replaceAll("	",""), cursor);
				}
			}
		})
	}
}