import { moment } from 'obsidian';
import { getTime, getFilename, momentToRegex, isTime, isTimePassed } from 'src/Tools/Utils';
// Icons
const Icons = {
    done: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path><path d="M7.5 12.5L10.5 15.5L16 10"></path></svg>',
    due: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>',
    scheduled: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 22h14"></path><path d="M5 2h14"></path><path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22"></path><path d="M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2"></path></svg>',
    start: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"></path></svg>',
    overdue: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>',
    process: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6H5a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h13l4-3.5L18 6Z"></path><path d="M12 13v9"></path><path d="M12 2v4"></path></svg>',
    dailynote: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>',
    unplanned: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.18 4.18A2 2 0 0 0 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 1.82-1.18"></path><path d="M21 15.5V6a2 2 0 0 0-2-2H9.5"></path><path d="M16 2v4"></path><path d="M3 10h7"></path><path d="M21 10h-5.5"></path><line x1="2" y1="2" x2="22" y2="22"></line></svg>',
    task: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle></svg>',
    add: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>',
    tag: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z"></path><path d="M7 7h.01"></path></svg>',
    repeat: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m17 2 4 4-4 4"></path><path d="M3 11v-1a4 4 0 0 1 4-4h14"></path><path d="m7 22-4-4 4-4"></path><path d="M21 13v1a4 4 0 0 1-4 4H3"></path></svg>',
    priority: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>',
    file: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><line x1="10" y1="9" x2="8" y2="9"></line></svg>',
    forward: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 17 20 12 15 7"></polyline><path d="M4 18v-2a4 4 0 0 1 4-4h12"></path></svg>',
    alert: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>',
    cancelled: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>'
}

export { Icons };

const getMeta = (tasks: any, input: {[name: string]: any}): Array<string> => {
	let {inbox, taskOrder, globalTaskFilter, dailyNoteFormat, done, forward, disableRecurrence, numberOfDays} = input;
    if(!dailyNoteFormat) 
        dailyNoteFormat = "YYYY-MM-DD";
	let today = moment().format("YYYY-MM-DD");
	let dailyNoteRegEx = momentToRegex(dailyNoteFormat);
	let timelineDates = [];
	numberOfDays = numberOfDays || "1";
	for(let i = 0; i < parseInt(numberOfDays); i++) {
		timelineDates.push(moment(today).add(i, 'days').format("YYYY-MM-DD"));
	}

	dailyNoteFormat = dailyNoteFormat || "YYYY-MM-DD";
	taskOrder = taskOrder || ["overdue", "due", "scheduled", "start", "done", "cancelled", "unplanned"];
	for (let task of tasks) {
		let happens: {[name: string]: string} = {};
		let taskText = task.text;
		let taskFile = getFilename(task.path);
		let filePath = task.link.path;
		
		// Inbox
		if (inbox && inbox == filePath && task.completed == false && !taskText.match(/[🛫|⏳|📅|✅] *(\d{4}-\d{2}-\d{2})/)) {
			happens["unplanned"] = today;
			task.order = taskOrder.indexOf("unplanned");
		};
		
		// Daily Notes
		let dailyNoteMatch = taskFile?.match(dailyNoteRegEx);
		let dailyTaskMatch = taskText.match(/[🛫|⏳|📅|✅] *(\d{4}-\d{2}-\d{2})/);
		if (dailyNoteMatch && task.completed == false && task.checked == false) {
			task.dailyNote = true;
			if(!dailyTaskMatch) {
				if (moment(dailyNoteMatch[1], dailyNoteFormat).format("YYYY-MM-DD") < today) {
					if (forward == true) {
						happens["unplanned"] = today;
						task.order = taskOrder.indexOf("unplanned");
					} else {
						happens["unplanned"] = moment(dailyNoteMatch[1], dailyNoteFormat).format("YYYY-MM-DD");
						task.order = taskOrder.indexOf("unplanned");
					};
				} else {
					happens["unplanned"] = moment(dailyNoteMatch[1], dailyNoteFormat).format("YYYY-MM-DD");
					task.order = taskOrder.indexOf("unplanned");
				};
			};
		} else if (dailyNoteMatch && task.completed == false && task.checked == true && moment(dailyNoteMatch[1], dailyNoteFormat).format("YYYY-MM-DD") >= today) {
			happens["cancelled"] = moment(dailyNoteMatch[1], dailyNoteFormat).format("YYYY-MM-DD");
			task.order = taskOrder.indexOf("cancelled");
		} else if (dailyNoteMatch) {
			task.dailyNote = true;
		} else if (!dailyNoteMatch) {
			task.dailyNote = false;
		};
		
		// Dataview Tasks
		let inlineFields;
		while (inlineFields = /\[([^\]]+)\:\:([^\]]+)\]/g.exec(task.text)) {
			let inlineField = inlineFields[0];
			let fieldKey = inlineFields[1].toLowerCase();
			let fieldValue = inlineFields[2];
			if ( fieldKey == "due" || fieldKey == "scheduled" || fieldKey == "start" || fieldKey == "completion") {
				let fieldDate = moment(fieldValue).format("YYYY-MM-DD");
				if (task.completed == false  && task.checked == false) {
					if ( fieldKey == "due" && fieldDate < today ) {
						if (forward == true) {
							happens["overdue"] = fieldDate;
							happens["overdueForward"] = today;
							task.order = taskOrder.indexOf("overdue");
						} else {
							happens["overdue"] = fieldDate;
							task.order = taskOrder.indexOf("overdue");
						};
					} else if ( fieldKey == "due" && fieldDate == today ) {
						happens["due"] = fieldDate;
						task.order = taskOrder.indexOf("due");
					} else if ( fieldKey == "due" && fieldDate > today ) {
						happens["due"] = fieldDate;
						task.order = taskOrder.indexOf("due");
					};
					if ( fieldKey == "scheduled" && fieldDate < today ) {
						happens["scheduled"] = fieldDate;
						happens["scheduledForward"] = today;
						task.order = taskOrder.indexOf("scheduled");
					} else if (fieldKey == "scheduled") {
						happens["scheduled"] = fieldDate;
						task.order = taskOrder.indexOf("scheduled");
					};
					if ( fieldKey == "start" && fieldDate < today ) {
						happens["start"] = fieldDate;
						happens["startForward"] = today;
						task.order = taskOrder.indexOf("start");
					} else if (fieldKey == "start") {
						happens["start"] = fieldDate;
						task.order = taskOrder.indexOf("start");
					};
				} else if (task.completed == true && task.checked == true) {
					if (fieldKey == "completion") {
						happens["done"] = fieldDate;
						task.order = taskOrder.indexOf("done");
					};
				} else if (task.completed == false && task.checked == true && fieldDate >= today) {
						happens["cancelled"] = fieldDate;
						task.order = taskOrder.indexOf("cancelled");	
				};
			};
			task.text = task.text.replace(inlineField, "");
		};
		
		// Tasks Plugin Tasks
		let dueMatch = taskText.match(/📅 *(\d{4}-\d{2}-\d{2})/);
		if (dueMatch && task.completed == false && task.checked == false) {
			task.text = task.text.replace(dueMatch[0], "");
			task.moment = moment(dueMatch[1]);
			task.test = dueMatch[1];
			task.fullText = taskText;
			if ( dueMatch[1] < today ) {
				if (forward == true) {
					happens["overdue"] = dueMatch[1];
					happens["overdueForward"] = today;
					task.order = taskOrder.indexOf("overdue");
				} else {
					happens["overdue"] = dueMatch[1];
					task.order = taskOrder.indexOf("overdue");
				};
			} else if ( dueMatch[1] == today ) {
				happens["due"] = dueMatch[1];
				task.order = taskOrder.indexOf("due");
			} else if ( dueMatch[1] > moment().format("YYYY-MM-DD") ) {
				happens["due"] = dueMatch[1];
				task.order = taskOrder.indexOf("due");
			};
		} else if (dueMatch && task.completed == true && task.checked == true) {
			task.text = task.text.replace(dueMatch[0], "");
		} 
		let scheduledMatch = taskText.match(/⏳ *(\d{4}-\d{2}-\d{2})/);
		if (scheduledMatch && task.completed == false && task.checked == false) {
			task.moment = moment(scheduledMatch[1]);
			task.text = task.text.replace(scheduledMatch[0], "");
			if ( scheduledMatch[1] < today ) {
				happens["scheduled"] = scheduledMatch[1];
				happens["scheduledForward"] = today;
				task.order = taskOrder.indexOf("scheduled");
			} else {
				happens["scheduled"] = scheduledMatch[1];
				task.order = taskOrder.indexOf("scheduled");
			};
		} else if (scheduledMatch && task.completed == true) {
			task.text = task.text.replace(scheduledMatch[0], "");
		};
		if((dueMatch || scheduledMatch) && task.completed == false && task.checked == true) {
			let timeMatch = dueMatch ? dueMatch : scheduledMatch;
			task.text = task.text.replace(timeMatch[0], "");
			happens["cancelled"] = timeMatch[1];
			task.order = taskOrder.indexOf("cancelled");
			task.done = true;
		};
		let startMatch = taskText.match(/🛫 *(\d{4}-\d{2}-\d{2})/);
		if (startMatch && task.completed == false && task.checked == false) {
			task.moment = moment(startMatch[1]);
			task.text = task.text.replace(startMatch[0], "");
			if ( startMatch[1] < today ) {
				happens["start"] = startMatch[1];
				happens["startForward"] = today;
				task.order = taskOrder.indexOf("start");
			} else {
				happens["start"] = startMatch[1];
				task.order = taskOrder.indexOf("start");
			};
		} else if (startMatch && task.completed == true) {
			task.text = task.text.replace(startMatch[0], "");
		};
		let doneMatch = taskText.match(/✅ *(\d{4}-\d{2}-\d{2})/);
		if (doneMatch && task.completed == true && task.checked == true) {
			task.text = task.text.replace(doneMatch[0], "");
			if (done == true || doneMatch[1] == today) {
				happens["done"] = doneMatch[1];
				task.order = taskOrder.indexOf("done");
			}
			task.done = true;
		};
		let repeatMatch = taskText.match(/🔁 ?([a-zA-Z0-9, !]+)/)
		if (repeatMatch) {
            let matchResult = taskText.match(/🔁\s*(.*?)\s*[🛫⏳📅⌚]/);
            task.recurrence = true;
            if(disableRecurrence != "true"){
                task.recurringValue = matchResult ? matchResult[1] : "";
            }
			task.repeat = repeatMatch[1];
			task.text = task.text.replace(repeatMatch[0], "");
		};
		let lowMatch = taskText.includes("🔽");
		if (lowMatch) {
			task.text = task.text.replace("🔽","");
			task.priority = "D";
			task.priorityLabel = "low priority";
		};
		let mediumMatch = taskText.includes("🔼");
		if (mediumMatch) {
			task.text = task.text.replace("🔼","");
			task.priority = "B";
			task.priorityLabel = "medium priority";
		};
		let highMatch = taskText.includes("⏫");
		if (highMatch) {
			task.text = task.text.replace("⏫","");
			task.priority = "A";
			task.priorityLabel = "high priority";
		};
		if (!lowMatch && !mediumMatch && !highMatch) {
			task.priority = "C";
		}
		if (globalTaskFilter) {
			task.text = task.text.replaceAll(globalTaskFilter,"");
		} else {
			task.text = task.text.replaceAll("#task","");
		};

		// Link Detection
		let outerLink;
		while (outerLink = /\[([^\]]+)\]\(([^)]+)\)/g.exec(task.text)) {
 			task.text = task.text.replace(outerLink[0], `<a class='external-link outerLink' href='${outerLink[2]}'>${outerLink[1]}</a>`);
 		};
		let innerLink;
 		while (innerLink = /\[\[([^\]]+)\]\]/g.exec(task.text)) {
 			task.text = task.text.replace(innerLink[0], `<a class='internal-link innerLink' href='${innerLink[1]}'>${innerLink[1]}</a>`);
 		};
		
		// Markdown Highlights
		let mark;
		while (mark = /\=\=([^\]]+)\=\=/g.exec(task.text)) {
			task.text = task.text.replace(mark[0], "<mark>" + mark[1] + "</mark>");
		};
		
		// Reminder Syntax
		let reminderMatch = taskText.match(/⏰ *(\d{4}-\d{2}-\d{2}) *(\d{2}\:\d{2})|⏰ *(\d{4}-\d{2}-\d{2})|(\(\@(\d{4}-\d{2}-\d{2}) *(\d{2}\:\d{2})\))|(\(\@(\d{4}-\d{2}-\d{2})\))/);
		if (reminderMatch) {
			task.text = task.text.replace(reminderMatch[0], "");
		};
		if(task.moment && isTime(task)){
            let time = getTime(taskText).split(":");
            task.moment.add(parseInt(time[0]), "hours").add(parseInt(time[1]), "minutes");
			task.type = "time";
		}
		if(Object.keys(happens).includes("overdue") || Object.keys(happens).some(key => /Forward/.test(key))){
			task.typePriority = 1;
		}else if(isTimePassed(task)){
			task.typePriority = 2;
		}else if(!isTime(task) && (Object.keys(happens).includes("due") || Object.keys(happens).includes("scheduled"))){
			task.typePriority = 3;
		}else if(Object.keys(happens).includes("start")){
			task.typePriority = 4;
		}else if(isTime(task)){
			task.typePriority = 5;
		}else if(Object.keys(happens).includes("done")){
			task.typePriority = 6;
		}else if (Object.keys(happens).includes("cancelled")) {
			task.typePriority = 7;
		}

		task.happens = happens;
	};
	return [...new Set(timelineDates)].sort();
}

const getRelative = (someDate: string) => {
	let date = moment(someDate);
	if (moment().diff(date, 'days') >= 1 || moment().diff(date, 'days') <= -1) {
		return date.fromNow();
	} else {
		return date.calendar().split(' ')[0];
	}
}

const getSelectOptions = (rootNode: HTMLElement, dailyNoteFolder: string, dailyNoteFormat: string, taskFiles:Array<any>, inbox: string, select: string) => {
	// Push daily note and Inbox files
    
    if(!dailyNoteFormat) 
        dailyNoteFormat = "YYYY-MM-DD";
	const currentDailyNote = dailyNoteFolder + moment().format(dailyNoteFormat) + ".md";
	taskFiles.push(currentDailyNote);
	if (inbox) {taskFiles.push(inbox)};
	taskFiles = [...new Set(taskFiles)].sort();
	// Loop files
	const fileSelect = rootNode.querySelector('.fileSelect')!;
	taskFiles.forEach(function(file) {
		let opt = document.createElement('option');
		opt.value = file;
		let secondParentFolder = file.split("/")[file.split("/").length - 3] == null ? "" : "… / ";
		let parentFolder = file.split("/")[file.split("/").length - 2] == null ? "" : `${secondParentFolder}📂&nbsp;${file.split("/")[file.split("/").length - 2]} / `;
		let filePath = `${parentFolder}📄&nbsp;${getFilename(file)}`;
		opt.innerHTML =  filePath;
		opt.title = file;
		if (select && file == select) {
			opt.setAttribute('selected', "true");
		} else if (select && select == "dailyNote" && file == currentDailyNote) {
			opt.setAttribute('selected', "true");
		}
		fileSelect.appendChild(opt);
	});
}

const addNewTask = (fileText: string, newTask: string, section: string|undefined) => {
	const newTaskText = `- [ ] ${newTask}`;
	if (section != undefined) {
		const lines = fileText.split("\n");
		const index = lines.indexOf(section);
		if (index != -1) {
			lines.splice(index + 1, 0, newTaskText);
			return lines.join("\n");
		} else {
			//@todo : replace confirm with a modal
			if (confirm(`Section marker '${section}' not found. Would you like to create it?`) == true) {
				return `${fileText.replace(/\n+$/, "")}\n\n${section}\n\n${newTaskText}`;
			}
		}
	}
	return `${fileText.replace(/\n+$/, "")}\n\n${newTaskText}`;
}

export { getMeta, getRelative, getSelectOptions, addNewTask };