import { App, moment, TFile, Notice, MarkdownView } from 'obsidian';
import { getAPI } from 'obsidian-dataview';
import { Icons } from './Tools/Timeline';
import { getMeta, getRelative, getSelectOptions, addNewTask } from './Tools/Timeline';
import { getMetaFromNote, getFilename, IsRecurringThisDay, sortTasks } from './Tools/Utils';
import { DurationInputArg1, DurationInputArg2 } from 'moment';

export default class Timeline {
    app: App;
    dv: any;
    rootNode: HTMLElement;
    tasks: any;
	taskFiles: Array<any>;
	section: string;
	timelineDates: Array<string>;
    constructor(app: App) {
        this.app = app;
        this.dv = getAPI(app);
    }
    checkErrors = (input: {[name: string]: string}) =>{
        let {pages, dailyNoteFormat} = input;
        // Error Handling
        if (!pages && pages!="") { this.rootNode.createSpan('> [!ERROR] Missing pages parameter\n> \n> Please set the pages parameter like\n> \n> `pages: ""`'); return true };
        if (dailyNoteFormat) { if (dailyNoteFormat.match(/[|\\YMDWwd.,-: \[\]]/g)?.length != dailyNoteFormat.length) { this.rootNode.createSpan('> [!ERROR] The `dailyNoteFormat` contains invalid characters'); return true }};
    }
    setTasks = (pages: string, hideFileWithProps: string) => {
        let dvPages;
        if (pages == "") {
            dvPages = this.dv.pages();
        } else if (typeof pages === "string" && pages.startsWith("dv.pages")) {
            const pagesContent = pages.match(/\((.*)\)/)?.[1];
            if (pagesContent) {
                dvPages = this.dv.pages(pagesContent);
            } else {
                dvPages = this.dv.pages();
            }
        } else {
            dvPages = this.dv.pages(pages);
        }
        if (hideFileWithProps) {
            this.tasks = dvPages.flatMap((p: any) => {
                let tasks = p.file.tasks;
                hideFileWithProps.split(",").forEach((prop: string) => {
                    if(p[prop.trim()])
                        tasks = tasks.filter((task: any) => task.checked);
                });
                return tasks;
            });
        }else{
            this.tasks = dvPages.file.tasks;
        }
    }

    createTimeline = (input: {[name: string]: string}, el: HTMLElement) => {
        let {pages, inbox, select, taskFiles, dailyNoteFolder, dailyNoteFormat, css, dateFormat, options, section, hideFileWithProps} = input;
        // Set Root
        let tid = (new Date()).getTime();
		this.section = section;
        this.rootNode = el.createEl("div", {cls: "taskido "+options || "", attr: {id: "taskido"+tid}});
		this.rootNode.createSpan();
        if(this.checkErrors(input)) return;
		this.setTasks(pages, hideFileWithProps);
        // Get, Set, Eval Pages
        if (!taskFiles) {
            this.taskFiles = [...new Set(this.dv.pages().file.map((f: any)=>f.tasks.filter((t: any)=>!t.completed)).path)].sort();
        } else {
            this.taskFiles = [...new Set(this.dv.pagePaths(taskFiles))].sort()
        }
        if (dailyNoteFolder && !dailyNoteFolder.endsWith("/")) {
            dailyNoteFolder = dailyNoteFolder+"/";
        }
        if (!dateFormat) {
			dateFormat = "ddd, MMM D";
		}
        if (!select) {
			select = "dailyNote";
		}

        if (css) {
			let style = this.rootNode.createEl("style");
			style.innerHTML = css;
			this.rootNode.querySelector("span")!.append(style);
		}

        // Initialze
        this.timelineDates = getMeta(this.tasks, input);
        this.getTimeline(dateFormat);
        getSelectOptions(this.rootNode, dailyNoteFolder || "", dailyNoteFormat, this.taskFiles, inbox, select);
        this.setEvents();
    }
	setEvents = () => {
		this.rootNode.querySelectorAll('.counter').forEach(cnt => cnt.addEventListener('click', (() => {
			let activeFocus = Array.from(this.rootNode.classList).filter(c=>c.endsWith("Filter") && !c.startsWith("today"))[0];
			if (activeFocus == cnt.id+"Filter") {
				this.rootNode.classList.remove(activeFocus);
				return false;
			};
			this.rootNode.classList.remove.apply(this.rootNode.classList, Array.from(this.rootNode.classList).filter(c=>c.endsWith("Filter") && !c.startsWith("today")));
			this.rootNode.classList.add(cnt.id+"Filter");
		})));
		this.rootNode.querySelector('.todayHeader')?.addEventListener('click', (() => {
			this.rootNode.classList.toggle("todayFocus");
		}));
		this.rootNode.querySelectorAll('.task:not(.star, .add)').forEach(t => t.addEventListener('click', ((e: MouseEvent) => {
			let link = t.getAttribute("data-link") || "";
			let line = t.getAttribute("data-line") || "";
			let col = t.getAttribute("data-col") || "";
			if ((e.target as Element)?.closest(".task .tag")) {
				// Tag
			} else if ((e.target as Element)?.closest(".timeline .icon")) {
				// Check
				let task = (e.target as Element)?.closest(".task");
				let icon = (e.target as Element)?.closest(".timeline .icon");
				if(task) task.className = "task done";
				if(icon) icon.innerHTML = Icons.done;
				this.completeTask(link, line, col);
			} else {
				// File
				this.openFile(link, line, col);
			};
		})));
		this.rootNode.querySelector('.ok')?.addEventListener('click', (() => {
			let filePath = (this.rootNode.querySelector('.fileSelect') as HTMLSelectElement)?.value;
			let newTask = (this.rootNode.querySelector('.newTask') as HTMLInputElement)?.value;
			if (newTask.length > 1) {
				try {
					let abstractFilePath = this.app.vault.getAbstractFileByPath(filePath);
					if (abstractFilePath && abstractFilePath instanceof TFile) {
						this.app.vault.process(abstractFilePath, (fileText: string) => addNewTask(fileText, newTask, this.section));
					} else {
						this.app.vault.create(filePath, "- [ ] " + newTask);
					};
					new Notice("New task saved!");
					if(this.rootNode.querySelector('.newTask') != null){
						(this.rootNode.querySelector('.newTask') as HTMLInputElement).value = "";
						(this.rootNode.querySelector('.newTask') as HTMLInputElement).focus();
					}
				} catch(err) {
					new Notice("Something went wrong!");
				};
			} else {
				(this.rootNode.querySelector('.newTask') as HTMLInputElement).focus();
			};
		}));
		this.rootNode.querySelector('.fileSelect')?.addEventListener('change', (() => {
			(this.rootNode.querySelector('.newTask') as HTMLInputElement).focus();
		}));
			(this.rootNode.querySelector('.newTask') as HTMLInputElement).addEventListener('input', (() => {
			let input = (this.rootNode.querySelector('.newTask') as HTMLInputElement);
			let newTask = input.value;
			
			// Icons
			if (newTask.includes("due ")) { input.value = newTask.replace("due", "📅") };
			if (newTask.includes("start ")) { input.value = newTask.replace("start", "🛫") };
			if (newTask.includes("scheduled ")) { input.value = newTask.replace("scheduled", "⏳") };
			if (newTask.includes("done ")) { input.value = newTask.replace("done", "✅") };
			if (newTask.includes("high ")) { input.value = newTask.replace("high", "⏫") };
			if (newTask.includes("medium ")) { input.value = newTask.replace("medium", "🔼") };
			if (newTask.includes("low ")) { input.value = newTask.replace("low", "🔽") };
			if (newTask.includes("repeat ")) { input.value = newTask.replace("repeat", "🔁") };
			if (newTask.includes("recurring ")) { input.value = newTask.replace("recurring", "🔁") };
			
			// Dates
			if (newTask.includes("today ")) { input.value = newTask.replace("today", moment().format("YYYY-MM-DD")) };
			if (newTask.includes("tomorrow ")) { input.value = newTask.replace("tomorrow", moment().add(1, "days").format("YYYY-MM-DD")) };
			if (newTask.includes("yesterday ")) { input.value = newTask.replace("yesterday", moment().subtract(1, "days").format("YYYY-MM-DD")) };
			
			// In X days/weeks/month/years
			let futureDate = newTask.match(/(in)\W(\d{1,3})\W(days|day|weeks|week|month|years|year) /);
			if (futureDate) {
				let x = parseInt(futureDate[2]);
				let unit = futureDate[3];
				let date = moment().add(x as DurationInputArg1, unit as DurationInputArg2).format("YYYY-MM-DD[ ]")
				input.value = newTask.replace(futureDate[0], date);
			};
			
			// Next Weekday
			let weekday = newTask.match(/(monday|tuesday|wednesday|thursday|friday|saturday|sunday) /);
			if (weekday) {
				let weekdays = ["","monday","tuesday","wednesday","thursday","friday","saturday","sunday"];
				const dayINeed = weekdays.indexOf(weekday[1]);
				if (moment().isoWeekday() < dayINeed) {
				  input.value = newTask.replace(weekday[1], moment().isoWeekday(dayINeed).format("YYYY-MM-DD")); 
				} else {
				  input.value = newTask.replace(weekday[1], moment().add(1, 'weeks').isoWeekday(dayINeed).format("YYYY-MM-DD"));
				}
			}
			
			(this.rootNode.querySelector('.newTask') as HTMLInputElement).focus();
		}));
		this.rootNode.querySelector('.newTask')?.addEventListener('keyup', ((e: KeyboardEvent) => {
			if (e.key === "Enter") { // Enter key
				(this.rootNode.querySelector('.ok') as HTMLElement)?.click();
			};
		}));
		this.rootNode.querySelector('.newTask')?.addEventListener('focus', (() => {
			this.rootNode.querySelector('.quickEntryPanel')?.classList.add("focus");
		}));
		this.rootNode.querySelector('.newTask')?.addEventListener('blur', (() => {
			this.rootNode.querySelector('.quickEntryPanel')?.classList.remove("focus");
		}));
	};

	openFile = (link: string, line: string, col: string) =>{
		this.app.workspace.openLinkText('', link).then(() => {
			if (line && col) {
				try {
					const view = this.app.workspace.getMostRecentLeaf()!.getViewState();
					view.state!.mode = 'source'; // mode = source || preview
					this.app.workspace.getMostRecentLeaf()!.setViewState(view);
					let cmEditor = this.app.workspace.getActiveViewOfType(MarkdownView)!.editor;
					cmEditor.setSelection({line: parseInt(line), ch: 6},{line: parseInt(line), ch: parseInt(col)});
					cmEditor.focus();
				} catch(err) {
					new Notice("Something went wrong!")
				}
			}
		})
	}

	completeTask = (link: string, line: string, col: string) => {
		this.app.workspace.openLinkText('', link).then(() => {
			if (line && col) {
				try {
					const view = this.app.workspace.getMostRecentLeaf()!.getViewState();
					view.state!.mode = 'source'; // mode = source || preview
					this.app.workspace.getMostRecentLeaf()!.setViewState(view);
					let cmEditor = this.app.workspace.getActiveViewOfType(MarkdownView)!.editor;
					let cmLine = cmEditor.getLine(parseInt(line));
					let addRange;
					if (cmLine.includes("🔁")) {
						addRange = 1
					} else {
						addRange = 0
					}
					cmEditor.setCursor(parseInt(line), parseInt(col));
					//@ts-ignore
					this.app.commands.executeCommandById('obsidian-tasks-plugin:toggle-done');
					cmEditor.setSelection({line: parseInt(line) + addRange, ch: 6},{line: parseInt(line) + addRange, ch: parseInt(col) + 13});
					cmEditor.focus();
				} catch(err) {
					new Notice("Something went wrong!")
				}
			}
		});
	}

	getTimeline = (dateFormat: string) => {
		let yearNode;
		let lastYear = null;
		let containedTypesPerYear = null;
		for (let timelineDate of this.timelineDates) {
			// Variables
			let tasksFiltered = this.tasks.filter((t: any)=>(Object.values(t.happens).includes(timelineDate.toString())) || 
				(IsRecurringThisDay(t, timelineDate)) && !t.done).sort((t:any)=>t, "asc", sortTasks);
			let date = moment(timelineDate.toString()).format(dateFormat);
			let weekday = moment(timelineDate.toString()).format("dddd");
			let year = moment(timelineDate.toString()).format("YYYY");
			let today = moment().format("YYYY-MM-DD");
			let detailsCls = "";
			let content = "";
			let containedTypesPerDay: Array<string> = [];
			
			// Add Year Section
			if (year != lastYear) {
				containedTypesPerYear = [];
				lastYear = year;
				yearNode = this.rootNode.createEl("div", {cls: "year", attr: {"data-types": ""}});
				if (moment().format("YYYY") == year) { yearNode.classList.add("current") };
				yearNode.innerHTML = year;
				this.rootNode.querySelector("span")!.appendChild(yearNode);
			};
			
			// Add Today Information
			if (timelineDate == today) {
				detailsCls += "today";
	
				let overdueCount = this.tasks.filter((t: any)=>t.happens["overdue"]).length;
				// let dueCount = tasksFiltered.filter((t: any)=>t.happens["due"]).length;
				// let startCount = tasksFiltered.filter((t: any)=>t.happens["start"]).length;
				// let scheduledCount = tasksFiltered.filter((t: any)=>t.happens["scheduled"]).length;
				// let doneCount = tasksFiltered.filter((t: any)=>t.happens["done"]).length;
				// let dailynoteCount = tasksFiltered.filter((t: any)=>t.happens["dailynote"]).length;
				// let processCount = tasksFiltered.filter((t: any)=>t.happens["process"]).length;
				let todoCount = tasksFiltered.filter((t: any)=>!t.completed && !t.happens["overdue"] && !t.happens["unplanned"]).length;
				let unplannedCount = this.tasks.filter((t: any)=>t.happens["unplanned"]).length;
				// let allCount = doneCount + todoCount + overdueCount;
				
				// Counter
				content = `<div class='todayHeader' aria-label='Focus today'>Today</div>
				<div class='counters'>
					<div class='counter' id='todo' aria-label='Filter tasks to do'>
						<div class='count'>${todoCount}</div>
						<div class='label'>To Do</div>
					</div>
					<div class='counter' id='overdue' aria-label='Filter overdue tasks'>
						<div class='count'>${overdueCount}</div>
						<div class='label'>Overdue</div>
					</div>
					<div class='counter' id='unplanned' aria-label='Filter unplanned tasks'>
						<div class='count'>${unplannedCount}</div>
						<div class='label'>Unplanned</div>
					</div>
				</div>
				<div class='quickEntryPanel'>
					<div class='left'><select class='fileSelect' aria-label='Select a note to add a new task to'></select><input class='newTask' type='text' placeholder='Enter your tasks here'/></div>
					<div class='right'>
						<button class='ok' aria-label='Append new task to selected note'>
							<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 10 4 15 9 20"></polyline><path d="M20 4v7a4 4 0 0 1-4 4H4"></path></svg>
						</button>
					</div>
				</div>`;
			}
			
			tasksFiltered.forEach((item: any) => {
				let file = getFilename(item.path);
				let header = item.header.subpath || item.path.replace(/.*\/([^\/]+)\.[^\.]+$/, '$1');
				let link = item.link.path.replace("'", "&apos;");
				let text = item.text;
				let posEndLine = item.position.start.line;
				let posEndCol = item.position.end.col;
				let info = "";
				let color = getMetaFromNote(item, "color", this.dv);
				if (!color) {color = "var(--text-muted)"};
				let cls = Object.keys(item.happens).find(key => item.happens[key] === timelineDate.toString())?.replace("Forward","") || "";
				if(cls == "" && item.recurrence) {cls = "repeat"};
				let dailyNote = item.dailyNote;
				containedTypesPerDay.push(cls);
				containedTypesPerYear.push(cls);
				// Handle forwarded tasks to get relative by cls
				for(let key in item.happens) {
					let value = item.happens[key];
					let relative = getRelative(value as string);
					// Append relative infos
					if (!key.includes("Forward") && key != "unplanned") {
						info += `<div class='relative' aria-label='${cls}:${value}'><div class='icon'>${Icons[key as keyof typeof Icons]}</div><div class='label'>${relative}</div></div>`;
					}
				}
	
				if (item.repeat) {
					info += `<div class='repeat' aria-label=''><div class='icon'>${Icons.repeat}</div><div class='label'>${item.repeat.replace("🔁", "")}</div></div>`;
				};
				
				if (item.priorityLabel) {
					info += `<div class='priority' aria-label=''><div class='icon'>${Icons.priority}</div><div class='label'>${item.priorityLabel}</div></div>`;
				};
				
				info += `<div class='file' aria-label='${item.path}'><div class='icon'>${Icons.file}</div><div class='label'>${file}<span class='header'> >${header}</span></div></div>`;
				
				item.tags.forEach(function(tag: string) {
					let tagText = tag.replace("#","");
					let hexColorMatch = tag.match(/([a-fA-F0-9]{6}|[a-fA-F0-9]{3})\/(.*)/);
					let style;
					if (hexColorMatch) {
						style = "style='--tag-color:#" + hexColorMatch[1] + ";--tag-background:#" + hexColorMatch[1] + "1a'";
						tagText = hexColorMatch[2];
					} else {
						style = "style='--tag-color:var(--text-muted)'";
					};
					info += "<a href='" + tag + "' class='tag' " + style + " aria-label='#" + tagText + "'><div class='icon'>" + Icons.tag + "</div><div class='label'>" + tagText + "</div></a>";
					text = text.replace(tag, "");
				});
				let icon;
				if (item.completed) { icon = Icons.done } else { icon = Icons.task };
				if (cls == "overdue") { icon = Icons.alert } else if (cls == "cancelled") { icon = Icons.cancelled };
				let task = "<div data-line='" + posEndLine + "' data-col='" + posEndCol + "' data-link='" + link + "' data-dailynote='" + dailyNote + "' class='task " + cls + "' style='--task-color:" + color + "' aria-label='" + file + "'><div class='timeline'><div class='icon'>" + icon + "</div><div class='stripe'></div></div><div class='lines'><a class='internal-link' href='" + link + "'><div class='content'>" + text + "</div></a><div class='line info'>" + info + "</div></div></div>";
				content += task;
			});
			
			// Set Date Template
			let dateTemplate = "<div class='dateLine'><div class='date'>" + date + "</div><div class='weekday'>" + "</div></div><div class='content'>" + content + "</div>"
			
			// Append To Root Node
			containedTypesPerDay = [...new Set(containedTypesPerDay)].sort();
			let element = this.rootNode.createEl("div", {cls: `details ${detailsCls}`, attr: {"data-year": year, "data-types": containedTypesPerDay.join(" ")}});
			element.innerHTML = dateTemplate;
			this.rootNode.querySelector("span")!.appendChild(element);
			
			// Set containedTypesPerYear
			containedTypesPerYear = [...new Set(containedTypesPerYear)].sort() as Array<string>;
			yearNode?.setAttribute("data-types", containedTypesPerYear.join(" "));
		}
		
	}
}