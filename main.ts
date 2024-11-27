import { App, Plugin, MarkdownView } from 'obsidian';
import Calendar from 'src/Calendar';
import Timeline from 'src/Timeline';

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
		this.registerMarkdownCodeBlockProcessor("Taskido", (source, el, ctx) => {
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
			new Timeline(this.app).createTimeline(input, el.createEl('div'));
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
		});
		this.addCommand({
			id: 'create-timeline',
			name: 'Create Timeline',
			callback: () => {
				const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
				if (activeView) {
					const editor = activeView.editor;
					const cursor = editor.getCursor();
					editor.replaceRange(
						`\`\`\`Taskido
						pages: ""
						numberOfDays: 3
						\`\`\``.replaceAll("	",""), cursor);
				}
			}
		})
	}
}