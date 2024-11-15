import { moment } from "obsidian";
import { RRule } from "rrule";

/**
 * List of icons 
 */
const arrowLeftIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>';
const arrowRightIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>';
const filterIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>';
const monthIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line><path d="M8 14h.01"></path><path d="M12 14h.01"></path><path d="M16 14h.01"></path><path d="M8 18h.01"></path><path d="M12 18h.01"></path><path d="M16 18h.01"></path></svg>';
const weekIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line><path d="M17 14h-6"></path><path d="M13 18H7"></path><path d="M7 14h.01"></path><path d="M17 18h.01"></path></svg>';
const listIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>';
const calendarClockIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 7.5V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h3.5"></path><path d="M16 2v4"></path><path d="M8 2v4"></path><path d="M3 10h5"></path><path d="M17.5 17.5 16 16.25V14"></path><path d="M22 16a6 6 0 1 1-12 0 6 6 0 0 1 12 0Z"></path></svg>';
const calendarCheckIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line><path d="m9 16 2 2 4-4"></path></svg>';
const calendarHeartIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14c0 1.1.9 2 2 2h7"></path><path d="M16 2v4"></path><path d="M8 2v4"></path><path d="M3 10h18"></path><path d="M21.29 14.7a2.43 2.43 0 0 0-2.65-.52c-.3.12-.57.3-.8.53l-.34.34-.35-.34a2.43 2.43 0 0 0-2.65-.53c-.3.12-.56.3-.79.53-.95.94-1 2.53.2 3.74L17.5 22l3.6-3.55c1.2-1.21 1.14-2.8.19-3.74Z"></path></svg>';

export { arrowLeftIcon, arrowRightIcon, filterIcon, monthIcon, weekIcon, listIcon };

/**
 * List of templates 
 */
const cellTemplate = (cls: string, weekday: string, dailyNote: string, cellName: string, cellContent: string) => 
    `<div class='cell ${cls}' data-weekday='${weekday}'><a class='internal-link cellName' href='${dailyNote}'>${cellName}</a><div class='cellContent'>${cellContent}</div></div>`;
const taskTemplate = (taskPath: string, cls: string, style: string, title: string, note: string, icon: string, relative: string, taskContent: string) => 
    `<a class='internal-link' href='${taskPath}'><div class='task ${cls}' style='${style}' title='${title}'><div class='inner'><div class='note'>${note}</div><div class='icon'>${icon}</div><div class='description' data-relative='${relative}'>${taskContent}</div></div></div></a>`;
const taskNumberTemplate = (number: number, cls: string) => `<div class='task taskNumber ${cls}' title='${number}'>${number}</div>`;

export { cellTemplate, taskNumberTemplate };
/**
 * Functions to filter tasks 
 */
const taskNotCompleted = (t:any) => !t.completed && !t.fullyCompleted;
const taskNotCancelled = (t:any) => t.status != "-";
const isNotCompletedOrCancelled = (t: any) => taskNotCancelled(t) && taskNotCompleted(t);
const isTodayTask = (t: any) => (t.due && moment(t.due.ts).isSame(moment(), 'day') || (t.scheduled && moment(t.scheduled.ts).isSame(moment(), 'day')));
const hasTimeFormat = (t: any) => /⌚(\d{2}:\d{2})/.test(t.text);

const getTime = (timeString : string) =>{
    const time = timeString.match(/⌚(\d{2}:\d{2})/);
    if(time && time[1])
        return time![1];
    else return "";
}

export { hasTimeFormat, getTime };

const isTimeBeforeCurrentTime = (t: any) => {
    const timeSubstring = getTime(t.text);
    if (timeSubstring) {
        return moment(timeSubstring, 'HH:mm').isBefore(moment());
    }
    // If any condition fails, return false
    return false;
}

const getFilename = (path: string): string | undefined  => 
    (path.match(/^(?:.*\/)?([^\/]+?|)(?=(?:\.[^\/.]*)?$)/)||[])[1];
const capitalize = (str: string): string => 
	str[0].toUpperCase() + str.slice(1);

const getCurrent = () => ({
        today: moment().format("YYYY-MM-DD"),
        day: moment().format("d"),
        month: moment().format("M"),
        year: moment().format("YYYY")
});

const momentToRegex = (momentFormat: string) : string => {
	momentFormat = momentFormat.replaceAll(".", "\\.");
	momentFormat = momentFormat.replaceAll(",", "\\,");
	momentFormat = momentFormat.replaceAll("-", "\\-");
	momentFormat = momentFormat.replaceAll(":", "\\:");
	momentFormat = momentFormat.replaceAll(" ", "\\s");
	
	momentFormat = momentFormat.replace("dddd", "\\w{1,}");
	momentFormat = momentFormat.replace("ddd", "\\w{1,3}");
	momentFormat = momentFormat.replace("dd", "\\w{2}");
	momentFormat = momentFormat.replace("d", "\\d{1}");
	
	momentFormat = momentFormat.replace("YYYY", "\\d{4}");
	momentFormat = momentFormat.replace("YY", "\\d{2}");
	
	momentFormat = momentFormat.replace("MMMM", "\\w{1,}");
	momentFormat = momentFormat.replace("MMM", "\\w{3}");
	momentFormat = momentFormat.replace("MM", "\\d{2}");
	
	momentFormat = momentFormat.replace("DDDD", "\\d{3}");
	momentFormat = momentFormat.replace("DDD", "\\d{1,3}");
	momentFormat = momentFormat.replace("DD", "\\d{2}");
	momentFormat = momentFormat.replace("D", "\\d{1,2}");
	
	momentFormat = momentFormat.replace("ww", "\\d{1,2}");

	return `/^(${momentFormat})$/`;
}
const getMeta = (dailyNoteFormat : string, globalTaskFilter: string, disableRecurrence: boolean, tasks: any)  =>{
    if (!dailyNoteFormat)
        dailyNoteFormat = "YYYY-MM-DD";
    if(!globalTaskFilter)
        globalTaskFilter = "#task";
    let dailyNoteRegEx = momentToRegex(dailyNoteFormat);
    for (let task of tasks) {
        let taskText = task.text;
        let taskFile = getFilename(task.path);
        let dueMatch = taskText.match(/\📅\W(\d{4}\-\d{2}\-\d{2})/);
        let scheduledMatch = taskText.match(/\⏳\W(\d{4}\-\d{2}\-\d{2})/);
        let startMatch = taskText.match(/\🛫\W(\d{4}\-\d{2}\-\d{2})/);
        let completionMatch = taskText.match(/\✅\W(\d{4}\-\d{2}\-\d{2})/);
        let cancelledMatch = taskText.match(/\❌\W(\d{4}\-\d{2}\-\d{2})/);
        let dailyNoteMatch = taskFile?.match(dailyNoteRegEx);
        let dailyTaskMatch = taskText.match(/(\d{4}\-\d{2}\-\d{2})/);
        let repeatMatch = taskText.includes("🔁");
        let matchResult = taskText.match(/🔁\s*(.*?)\s*[🛫⏳📅⌚]/);
        if (dueMatch) {
            task.due = dueMatch[1];
            task.text = task.text.replace(dueMatch[0], "");
        };
        if (scheduledMatch) {
            task.scheduled = scheduledMatch[1];
            task.text = task.text.replace(scheduledMatch[0], "");
        };
        if (startMatch) {
            task.start = startMatch[1];
            task.text = task.text.replace(startMatch[0], "");
        };
        if (completionMatch) {
            task.completion = completionMatch[1];
            task.text = task.text.replace(completionMatch[0], "");
        }
        if(cancelledMatch){
            task.cancelled = cancelledMatch[1];
            task.text = task.text.replace(cancelledMatch[0], "");
        }
        if(isOverdue(task)){
            task.type = "overdue";
            task.typePriority = 1;
            task.moment = task.due ? moment(task.due) : moment(task.scheduled);
        }else if(isTimePassed(task)){
            task.type = "timePassed";
            task.typePriority = 2;
            let time = getTime(taskText).split(":");
            let day = task.due ? moment(task.due) : moment(task.scheduled);
            task.moment = day.add(parseInt(time[0]), "hours").add(parseInt(time[1]), "minutes");
        }else if(isDueOrScheduled(task) && !hasTimeFormat(task)){
            if((task.due && task.scheduled && moment(task.due).isSameOrBefore(task.scheduled)) || task.due){
                task.type = "due";
                task.typePriority = 3;
                task.moment = moment(task.due);
            }else if(task.scheduled){
                task.type = "scheduled";
                task.typePriority = 3;
                task.moment = moment(task.scheduled);
            }
        }else if(isStart(task)){
            task.type = "start";
            task.typePriority = 4;
            task.moment = moment(task.start);
        }else if(isTime(task)){
            task.type = "time";
            task.typePriority = 5;
            let time = getTime(taskText).split(":");
            let day = task.due ? moment(task.due) : moment(task.scheduled);
            task.moment = day.add(parseInt(time[0]), "hours").add(parseInt(time[1]), "minutes");
        }else if(isDone(task)){
            task.type = "done";
            task.typePriority = 6;
            task.moment = moment(task.completion);
        }else if(isCancelled(task)){
            task.type = "cancelled";
            task.typePriority = 7;
            if(task.cancelled)
                task.moment = moment(task.cancelled);
        }
        if (dailyNoteMatch && !dailyTaskMatch) {
            task.dailyNote = moment(dailyNoteMatch[1], dailyNoteFormat).format("YYYY-MM-DD");
        }
        if (task.type != "done" && task.type != "cancelled" && repeatMatch) {
            task.recurrence = true;
            if(!disableRecurrence){
                task.recurringValue = matchResult ? matchResult[1] : "";
            }
            task.text = task.text.substring(0, taskText.indexOf("🔁"))
        };
        
        if(taskText.includes("🔺")){
            task.priority = 0;
        }else if (taskText.includes("⏫")) {
            task.priority = 1;
        }else if (taskText.includes("🔼")) {
            task.priority = 2;
        }else if (taskText.includes("🔽")) {
            task.priority = 3;
        }else {
            task.priority = 4;
        }
        task.text = task.text.replaceAll(globalTaskFilter,"").replaceAll("[[","").replaceAll("]]","").replace(/\[.*?\]/gm,"");
    }
}

const getTasks = (tasks : any, date: any) => 
    tasks.filter((t: any) => filterTasks(t, date)).sort((t:any)=>t, "asc", sortTasks);

const isOverdue = (task: any) => 
    isNotCompletedOrCancelled(task) && (
        (task.due && moment(task.due).isBefore(moment(), 'day'))
        ||(task.scheduled && moment(task.scheduled).isBefore(moment(), 'day')));

const isTimePassed = (task: any) =>
    isNotCompletedOrCancelled(task) && isTodayTask(task) && isTimeBeforeCurrentTime(task);

const isDueOrScheduled = (task: any) =>
    isNotCompletedOrCancelled(task) && (task.due || task.scheduled);

const isStart = (task: any) =>
    isNotCompletedOrCancelled(task) && task.start;

const isTime = (task: any) =>
    isNotCompletedOrCancelled(task) && hasTimeFormat(task) && isDueOrScheduled(task);

const isDone = (task: any) =>
    task.completed && task.checked;

const isCancelled = (task: any) =>
    !task.completed && task.checked;

const setTaskContentContainer = (status: any,dv: any, date: any, skipRecurrences?: boolean) => {
	let cellContent = "";
	for (let task of status) {
        if(skipRecurrences && task.recurrence) continue;
        let type = task.recurrence && !(task.type == "overdue" && moment().isSame(date, 'day')) ? "recurrence" : task.type;
        cellContent += setTask(task, type, dv)
    };
	return cellContent;
}

const updateCounters = (status: any, counter: {[key: string]: number}, currentDate: any) => {
    for(let key in counter)
        if(key != "overdue")
            counter[key] += status.filter((t:any)=>t.type == key).length;
    counter.recurrence += status.filter((t:any)=>t.recurrence && !(t.type == "overdue" && moment().isSame(currentDate, 'day'))).length;
    counter.overdue += status.filter((t:any)=>t.type == "overdue" && moment().isSame(currentDate, 'day')).length;
}

export { getCurrent, getMeta, getTasks, setTaskContentContainer, updateCounters};
const setStatisticPopUp = (rootNode: HTMLElement) => {
    let element = rootNode.createEl("ul", {cls: "statisticPopup"});
    element.innerHTML =  `
        <li id='statisticDone' data-group='done'></li>
        <li id='statisticDue' data-group='due'></li>
        <li id='statisticOverdue' data-group='overdue'></li>
        <li class='break'></li>
        <li id='statisticStart' data-group='start'></li>
        <li id='statisticScheduled' data-group='scheduled'></li>
        <li id='statisticRecurrence' data-group='recurrence'></li>
        <li class='break'></li>
        <li id='statisticDailyNote' data-group='dailyNote'></li>
    `;
	rootNode.querySelector("span")!.appendChild(element);
	setStatisticPopUpEvents(rootNode);
};

const setWeekViewContext = (rootNode: HTMLElement) =>{
	let activeStyle = Array.from(rootNode.classList).filter(v=>v.startsWith("style"))[0];
	let liElements = "";
	for (let i=1;i<12;i++) {
        liElements += `
        <li ${activeStyle==`style${i}` ? `class="active"`:"" } data-style='style${i}'>
            <div class='liIcon iconStyle${i}'>
                <div class='box'></div>
                <div class='box'></div>
                <div class='box'></div>
                <div class='box'></div>
                <div class='box'></div>
                <div class='box'></div>
                <div class='box'></div>
            </div>Style ${i}
        </li>`;
	};
    let element = rootNode.createEl("ul", {cls: "weekViewContext"});
    element.innerHTML = liElements;
	rootNode.querySelector("span")!.appendChild(element);
	setWeekViewContextEvents(rootNode);
};

const setStatisticValues = (rootNode: HTMLElement, counter: {[key: string]: number}) =>{
    const { due, done, overdue, start, scheduled, recurrence, dailyNote } = counter;
	let taskCounter = due+done+overdue;
	let tasksRemaining  = (taskCounter - done) as string | number;
	let percentage = Math.round(100/(due+done+overdue)*done);
	percentage = isNaN(percentage) ? 100 : percentage;
	if(rootNode.querySelector("button.statistic")){
        if (due == 0 && done == 0) {
            rootNode.querySelector("button.statistic")!.innerHTML = calendarHeartIcon;
        } else if (tasksRemaining as number > 0) {
            rootNode.querySelector("button.statistic")!.innerHTML = calendarClockIcon;
        } else if (due == 0 && done != 0) {
            rootNode.querySelector("button.statistic")!.innerHTML = calendarCheckIcon;
        }
    }
	if (tasksRemaining as number > 99) {tasksRemaining = "⚠️"};
    if(rootNode.querySelector("button.statistic")){
        rootNode.querySelector("button.statistic")!.setAttribute("data-percentage", percentage.toString());
        rootNode.querySelector("button.statistic")!.setAttribute("data-remaining", tasksRemaining.toString());
    }
    if(rootNode.querySelector("#statisticDone"))
        (rootNode.querySelector("#statisticDone") as HTMLElement)!.innerText = `✅ Done: ${done}/${taskCounter}`;
	if(rootNode.querySelector("#statisticDue"))
        (rootNode.querySelector("#statisticDue") as HTMLElement)!.innerText = `📅 Due: ${due}`;
	if(rootNode.querySelector("#statisticOverdue"))
        (rootNode.querySelector("#statisticOverdue") as HTMLElement)!.innerText = `⚠️ Overdue: ${overdue}`;
	if(rootNode.querySelector("#statisticStart"))
        (rootNode.querySelector("#statisticStart") as HTMLElement)!.innerText = `🛫 Start: ${start}`;
	if(rootNode.querySelector("#statisticScheduled"))
        (rootNode.querySelector("#statisticScheduled") as HTMLElement)!.innerText = `⏳ Scheduled: ${scheduled}`;
	if(rootNode.querySelector("#statisticRecurrence"))
        (rootNode.querySelector("#statisticRecurrence") as HTMLElement)!.innerText = `🔁 Recurrence: ${recurrence}`;
	if(rootNode.querySelector("#statisticDailyNote"))
        (rootNode.querySelector("#statisticDailyNote") as HTMLElement)!.innerText = `📄 Daily Notes: ${dailyNote}`;
}

const removeExistingView = (rootNode: HTMLElement) =>{
	if (rootNode.querySelector(`.grid`)) {
		rootNode.querySelector(`.grid`)!.remove();
	} else if (rootNode.querySelector(`.list`)) {
		rootNode.querySelector(`.list`)!.remove();
	};
};

export { setStatisticPopUp, setWeekViewContext, setStatisticValues, removeExistingView };
const getMetaFromNote = (task: any, metaName: string, dv: any) => {
    return dv.pages(`"${task.link.path}"`)[metaName][0] || "";
}

const transColor = (color: string, percent: number): string => {
    let num = parseInt(color.replace("#", ""), 16);
    let amt = Math.round(2.55 * percent);
    let R = Math.min(255, Math.max(0, (num >> 16) + amt));
    let G = Math.min(255, Math.max(0, (num >> 8 & 0x00FF) + amt));
    let B = Math.min(255, Math.max(0, (num & 0x0000FF) + amt));
    return `#${((1 << 24) + (R << 16) + (G << 8) + B).toString(16).slice(1).toUpperCase()}`;
}

const filterTasks = (task: any, date: any) => {
    if(task.type == "overdue" && moment(date).isSame(moment(), 'day')){
        return true;
    }else if(task.type == "overdue" && moment(date).isBefore(moment(), 'day')){
        return false;
    }
    if(task.recurrence){
        return IsRecurringThisDay(task, date);
    }else if(task.moment){
        return task.moment.isSame(moment(date), "day");
    }else{
        return false;
    }
}
const sortTasks = (a: any, b: any) =>{
    if(a.type != b.type){
        return a.typePriority - b.typePriority;
    }
    if(a.type == "time" || a.type == "timePassed"){
        return a.moment.diff(b.moment);
    }
    return a.priority - b.priority;
}

const IsRecurringThisDay = (task: any, date: any)=>{
    if(!task.recurringValue)
        return false;
    try{
        let rule = new RRule({
            ...RRule.fromText(task.recurringValue).origOptions,
            dtstart: task.moment.add(1,"minute").toDate()
        });
        let startOfDay = moment(date).startOf("day").toDate();
        let endOfDay = moment(date).endOf("day").toDate();
        let occurrences = rule.between(startOfDay, endOfDay);
        return occurrences.length > 0;
    }catch(e){
        return false;
    }
    
}

const setTask = (obj: any, cls: string, dv: any) =>{
	const lighter = 25;
	const darker = -40;
	const noteColor = getMetaFromNote(obj, "color", dv);
	const textColor = getMetaFromNote(obj, "textColor", dv);
	const noteIcon = getMetaFromNote(obj, "icon", dv);
	const taskText = obj.text.replace("'", "&apos;");
	const taskPath = obj.link.path.replace("'", "&apos;");
    const relative = obj.due ? moment(obj.due).fromNow() : "";
	const tasksubpath = obj.header.subpath;
	const taskLine = tasksubpath ? taskPath+"#"+tasksubpath : taskPath;
	let taskIcon = "";
	let noteFilename = getFilename(taskPath);
    let style;
    if(cls.toLocaleLowerCase() == "done")
        taskIcon = "✅";
    else if(cls.toLocaleLowerCase() == "due")
        taskIcon = "📅";
    else if(cls.toLocaleLowerCase() == "scheduled")
        taskIcon = "⏳";
    else if(cls.toLocaleLowerCase() == "recurrence")
        taskIcon = "🔁";
    else if(cls.toLocaleLowerCase() == "overdue")
        taskIcon = "⚠️";
    else if(cls.toLocaleLowerCase() == "process")
        taskIcon = "⏺️";
    else if(cls.toLocaleLowerCase() == "cancelled")
        taskIcon = "🚫";
    else if(cls.toLocaleLowerCase() == "start")
        taskIcon = "🛫";
    else if(cls.toLocaleLowerCase() == "dailynote")
        taskIcon = "📄";
    else if(cls.toLocaleLowerCase() == "time")
        taskIcon = "⌚";

	if (noteIcon) {
        noteFilename = `${noteIcon} ${noteFilename}`;
    } else {
        noteFilename = `${taskIcon} ${noteFilename}`; 
        cls += " noNoteIcon";
    }
    
    const backgroundColor = noteColor ? `${noteColor}33` : `#7D7D7D33`;
    const taskColor = noteColor || "#7D7D7D";
    const darkTextColor = textColor || transColor(taskColor, darker);
    const lightTextColor = textColor || transColor(taskColor, lighter);

    style = `--task-background:${backgroundColor};--task-color:${taskColor};--dark-task-text-color:${darkTextColor};--light-task-text-color:${lightTextColor}`;
    
	return taskTemplate(taskLine, cls, style, `${noteFilename}: ${taskText}`, noteFilename, taskIcon, relative, taskText);
}

const setStatisticPopUpEvents = (rootNode: HTMLElement) => {
	rootNode.querySelectorAll('.statisticPopup li').forEach(li => li.addEventListener('click', (() => {
		const group = li.getAttribute("data-group") as string;
		const liElements = rootNode.querySelectorAll('.statisticPopup li');
        const active = li.classList.contains("active");
        for (const liElement of Array.from(liElements)) {
            liElement.classList.remove('active');
        }
		if (active) {
			rootNode.classList.remove("focus"+capitalize(group));
		} else {
			li.classList.add("active");
			rootNode.classList.remove.apply(rootNode.classList, Array.from(rootNode.classList).filter(v=>v.startsWith("focus")));
			rootNode.classList.add("focus"+capitalize(group));
		}
	})));
}


const setWeekViewContextEvents = (rootNode: HTMLElement) => {
	rootNode.querySelectorAll('.weekViewContext li').forEach(li => li.addEventListener('click', (() => {
		const selectedStyle = li.getAttribute("data-style")!;
		if (!li.classList.contains("active")) {
			for (const liElement of Array.from(rootNode.querySelectorAll('.weekViewContext li'))) {
				liElement.classList.remove('active');
			};
			li.classList.add("active");
			rootNode.classList.remove.apply(rootNode.classList, Array.from(rootNode.classList).filter(v=>v.startsWith("style")));
			rootNode.classList.add(selectedStyle);
		};
		rootNode.querySelector(".weekViewContext")!.classList.toggle("active");
	})));
}