import { App, moment } from 'obsidian';
import { getAPI } from 'obsidian-dataview';
import { arrowLeftIcon, arrowRightIcon, filterIcon, monthIcon, weekIcon, listIcon } from 'src/Tools/Utils';
import { cellTemplate, taskNumberTemplate } from 'src/Tools/Utils';
import { getCurrent, getMeta, getTasks, setTaskContentContainer, updateCounters } from 'src/Tools/Utils';
import { setStatisticPopUp, setWeekViewContext, setStatisticValues, removeExistingView } from 'src/Tools/Utils';

export default class Calendar {
    dv: any;
    tasks: any;
    rootNode: HTMLElement;
    firstDayOfWeek: number;
    upcomingDays: number;
    dailyNoteFolder: string;
    taskCountOnly: boolean;
    selectedDate: any;
    constructor(app: App){
        this.dv = getAPI(app);
    }
    checkForErrors = (input: {[name: string]: string}, el: HTMLElement) => {
        let {view, firstDayOfWeek, dailyNoteFormat, startPosition, options} = input;
        if (!options.includes("style")) {
            el.createSpan('> [!ERROR] Missing style parameter\n> \n> Please set a style inside options parameter like\n> \n> `options: "style1"`')
            return false;
        }
        if (!view) { 
            el.createSpan('> [!ERROR] Missing view parameter\n> \n> Please set a default view inside view parameter like\n> \n> `view: "month"`');
            return false;
        }
        if (firstDayOfWeek) { 
            if (firstDayOfWeek.match(/[|\\0123456]/g) == null) { 
                el.createSpan('> [!ERROR] Wrong value inside firstDayOfWeek parameter\n> \n> Please choose a number between 0 and 6');
                return false;
            };
        } else {
            el.createSpan('> [!ERROR] Missing firstDayOfWeek parameter\n> \n> Please set the first day of the week inside firstDayOfWeek parameter like\n> \n> `firstDayOfWeek: "1"`'); 
            return false;
        };
        if (startPosition && !startPosition.match(/\d{4}\-\d{1,2}/gm)) {
            el.createSpan('> [!ERROR] Wrong startPosition format\n> \n> Please set a startPosition with the following format\n> \n> Month: `YYYY-MM` | Week: `YYYY-ww`');
            return false;
        }
        if (dailyNoteFormat && dailyNoteFormat.match(/[|\\YMDWwd.,-: \[\]]/g) && dailyNoteFormat.match(/[|\\YMDWwd.,-: \[\]]/g)!.length != dailyNoteFormat.length) { 
            el.createSpan('> [!ERROR] The `dailyNoteFormat` contains invalid characters'); 
            return false; 
        }
        return true;
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
	displayCalendar = (input: {[name: string]: string}, element: HTMLElement) => {
        if(!this.checkForErrors(input, element)){
            return false;
        }
        let {pages, view, firstDayOfWeek, globalTaskFilter, dailyNoteFolder, dailyNoteFormat, startPosition, upcomingDays, 
            css, options, taskCountOnly, disableRecurrence, hideFileWithProps} = input;
        this.firstDayOfWeek = firstDayOfWeek? parseInt(firstDayOfWeek) : 0;
        this.upcomingDays = upcomingDays? parseInt(upcomingDays) : 7;
        this.dailyNoteFolder = dailyNoteFolder ? dailyNoteFolder : "";
        this.taskCountOnly = taskCountOnly == "true";
        this.setTasks(pages, hideFileWithProps);
        // Variables
        let tid = (new Date()).getTime();
        if (view.toLowerCase() == "month") {
            this.selectedDate = moment(startPosition || moment(), "YYYY-MM").date(1);
        } else if (view.toLowerCase() == "week") {
            this.selectedDate = moment(startPosition || moment(), "YYYY-ww").startOf("week");
        } else if (view.toLowerCase() == "list") {
            this.selectedDate = moment(startPosition || moment(), "YYYY-MM").date(1);
        }
        this.rootNode = element as HTMLElement;
        this.rootNode.classList.add("tasksCalendar");
        options.split(" ").forEach((option: string) => {
            this.rootNode.classList.add(option);
        });
        this.rootNode.setAttribute("id", "tasksCalendar"+tid);
        this.rootNode.setAttribute("view", view);
        this.rootNode.setAttribute("style", 'position:relative;-webkit-user-select:none!important');
        this.rootNode.createSpan();
        if (css) {
            let style = document.createElement("style");
            style.innerHTML = css;
            this.rootNode.append(style)
        }
        // Initialze
        getMeta(dailyNoteFormat, globalTaskFilter, disableRecurrence == "true", this.tasks);
        this.setButtons();
        setStatisticPopUp(this.rootNode);
        setWeekViewContext(this.rootNode);
        if(view.toLowerCase() == "month") {
            this.getMonth();
        } else if(view.toLowerCase() == "week") {
            this.getWeek();
        } else if(view.toLowerCase() == "list") {
            this.getList();
        }
    }
    
    setButtonEvents = () => {
        this.rootNode.querySelectorAll('button').forEach(btn => btn.addEventListener('click', (() => {
            let activeView = this.rootNode.getAttribute("view");
            if ( btn.className == "previous" ) {
                if (activeView == "month") {
                    this.selectedDate = moment(this.selectedDate).subtract(1, "months");
                    this.getMonth();
                } else if (activeView == "week") {
                    this.selectedDate = moment(this.selectedDate).subtract(7, "days").startOf("week");
                    this.getWeek();
                } else if (activeView == "list") {
                    this.selectedDate = moment(this.selectedDate).subtract(1, "months");
                    this.getList();
                }
            } else if ( btn.className == "current") {
                if (activeView == "month") {
                    this.selectedDate = moment().date(1);
                    this.getMonth();
                } else if (activeView == "week") {
                    this.selectedDate = moment().startOf("week");
                    this.getWeek();
                } else if (activeView == "list") {
                    this.selectedDate = moment().date(1);
                    this.getList();
                };
            } else if ( btn.className == "next" ) {
                if (activeView == "month") {
                    this.selectedDate = moment(this.selectedDate).add(1, "months");
                    this.getMonth();
                } else if (activeView == "week") {
                    this.selectedDate = moment(this.selectedDate).add(7, "days").startOf("week");
                    this.getWeek();
                } else if (activeView == "list") {
                    this.selectedDate = moment(this.selectedDate).add(1, "months");
                    this.getList();
                };
            } else if ( btn.className == "filter" ) {
                this.rootNode.classList.toggle("filter");
                this.rootNode.querySelector('#statisticDone')!.classList.remove("active");
                this.rootNode.classList.remove("focusDone");
            } else if ( btn.className == "monthView" ) {
                if ( moment().format("ww-YYYY") == moment(this.selectedDate).format("ww-YYYY") ) {
                    this.selectedDate = moment().date(1);
                } else {
                    this.selectedDate = moment(this.selectedDate).date(1);
                };
                this.getMonth();
            } else if ( btn.className == "listView" ) {
                if ( moment().format("ww-YYYY") == moment(this.selectedDate).format("ww-YYYY") ) {
                    this.selectedDate = moment().date(1);
                } else {
                    this.selectedDate = moment(this.selectedDate).date(1);
                };
                this.getList();
            } else if ( btn.className == "weekView" ) {
                if (this.rootNode.getAttribute("view") == "week") {
					let leftPos = (this.rootNode.querySelector("button.weekView") as HTMLElement).offsetLeft;
					(this.rootNode.querySelector(".weekViewContext") as HTMLElement).style.left = leftPos+"px";
                    this.rootNode.querySelector(".weekViewContext")!.classList.toggle("active");
                    if (this.rootNode.querySelector(".weekViewContext")!.classList.contains("active")) {
                        let closeContextListener = function() {
                            this.rootNode.querySelector(".weekViewContext").classList.remove("active");
                            this.rootNode.removeEventListener("click", closeContextListener, false);
                        };
                        setTimeout(function() {
                            this.rootNode.addEventListener("click", closeContextListener, false);
                        }, 100);
                    };
                } else {
                    if (moment().format("MM-YYYY") != moment(this.selectedDate).format("MM-YYYY")) {
                        this.selectedDate = moment(this.selectedDate).startOf("month").startOf("week");
                    } else {
                        this.selectedDate = moment().startOf("week");
                    };
                    this.getWeek();
                };
            } else if ( btn.className == "statistic" ) {
                this.rootNode.querySelector(".statisticPopup")!.classList.toggle("active");
            };
            btn.blur();
        })));
        this.rootNode.addEventListener('contextmenu', function(event) {
            event.preventDefault();
        });
    }
    setButtons = () => {
        let buttons = `
            <button class='filter'>
                ${filterIcon}
            </button>
            <button class='listView' title='List'>
                ${listIcon}
            </button>
            <button class='monthView' title='Month'>
                ${monthIcon}
            </button>
            <button class='weekView' title='Week'>
                ${weekIcon}
            </button>
            <button class='current'>
            </button>
            <button class='previous'>
                ${arrowLeftIcon}
            </button>
            <button class='next'>
                ${arrowRightIcon}
            </button>
            <button class='statistic' percentage=''>
            </button>`;
        let buttonsEl = this.rootNode.createEl("div", {cls: "buttons"});
        buttonsEl.innerHTML = buttons;
        this.rootNode.querySelector("span")!.appendChild(buttonsEl);
        this.setButtonEvents();
    };
    getMonth = async () => {
        removeExistingView(this.rootNode);
        this.rootNode.querySelector('button.current')!.innerHTML = `<span>${moment(this.selectedDate).format("MMMM")}</span><span>${moment(this.selectedDate).format("YYYY")}</span>`;
        let firstDayOfMonth = parseInt(moment(this.selectedDate).format("d"));
        let lastDateOfMonth = parseInt(moment(this.selectedDate).endOf("month").format("D"));
        let counter = {
            due: 0,
            done: 0,
            overdue: 0,
            start: 0,
            scheduled: 0,
            recurrence: 0,
            dailyNote: 0
        }
        let monthName = moment(this.selectedDate).format("MMM").replace(".","").substring(0,3);
        let current = getCurrent();
        
        // Move First Week Of Month To Second Week In Month View
        if (firstDayOfMonth == 0)
            firstDayOfMonth = 7;
        
        // Set Grid Heads
        let gridHeads = "";
        for (let h=0-firstDayOfMonth+this.firstDayOfWeek;h<7-firstDayOfMonth+this.firstDayOfWeek;h++) {
            let weekDayNr = moment(this.selectedDate).add(h, "days").format("d");
            let weekDayName = moment(this.selectedDate).add(h, "days").format("ddd");
            if ( current.day == weekDayNr && current.month == moment(this.selectedDate).format("M") && current.year == moment(this.selectedDate).format("YYYY") ) {
                gridHeads += `<div class='gridHead today' data-weekday='${weekDayNr}'>${weekDayName}</div>`;
            } else {
                gridHeads += `<div class='gridHead' data-weekday='${weekDayNr}'>${weekDayName}</div>`;
            };
        };
        
        
        const tasksPromises = [];
        // Set Wrappers
        let wrappers = "";
        let starts = 0-firstDayOfMonth+this.firstDayOfWeek;
        for (let w=1; w<7; w++) {
            tasksPromises.push((async () => {
                let wrapper = "";
                let weekNr = "";
                let yearNr = "";
                for (let i=starts;i<starts+7;i++) {
                    if (i==starts) {
                        weekNr = moment(this.selectedDate).add(i, "days").format("w");
                        yearNr = moment(this.selectedDate).add(i, "days").format("YYYY");
                    };
                    let currentDate = moment(this.selectedDate).add(i, "days").format("YYYY-MM-DD");
                    let dailyNotePath = this.dailyNoteFolder+"/"+currentDate
                    let weekDay = moment(this.selectedDate).add(i, "days").format("d");
                    let shortDayName = moment(this.selectedDate).add(i, "days").format("D");
                    let longDayName = moment(this.selectedDate).add(i, "days").format("D. MMM");
        
                    // Filter Tasks
                    let status = getTasks(this.tasks, currentDate);
                    // Count Events Only From Selected Month
                    if (moment(this.selectedDate).format("MM") == moment(this.selectedDate).add(i, "days").format("MM")) {
                        updateCounters(status, counter, currentDate);
                    };
                    
                    // Set New Content Container
                    
                    let cellContent = setTaskContentContainer(status, this.dv, currentDate);
                    let cls = "";
                    // Set prevMonth, currentMonth, nextMonth
                    if (i < 0) {
                        cls = "prevMonth";
                    } else if (i >= 0 && i < lastDateOfMonth && current.today !== currentDate) {
                        cls = "currentMonth";
                    } else if ( i >= 0 && i< lastDateOfMonth && current.today == currentDate) {
                        cls = "currentMonth today";
                    } else if (i >= lastDateOfMonth) {
                        cls = "nextMonth";
                    }
                    // Set Cell Name And Weekday
                    if(this.taskCountOnly){
                        cellContent = taskNumberTemplate(status.length, cls);
                    }
                    if ( parseInt(moment(this.selectedDate).add(i, "days").format("D")) == 1 ) {
                        wrapper += cellTemplate(`${cls} newMonth`, weekDay, dailyNotePath, longDayName, cellContent);
                    } else {
                        wrapper += cellTemplate(cls, weekDay, dailyNotePath, shortDayName, cellContent);
                    }
                }
                wrappers += `<div class='wrapper'><div class='wrapperButton' data-week='${weekNr}' data-year='${yearNr}'>W${weekNr}</div>${wrapper}</div>`;
                starts += 7;
            })());
        };
        let gridEl = this.rootNode.createEl("div", {cls: "grid"});
        gridEl.innerHTML = `<div class='gridHeads'><div class='gridHead'></div>${gridHeads}</div>
            <div class='wrappers' data-month='${monthName}'>${wrappers}</div>`;
        this.rootNode.querySelector("span")!.appendChild(gridEl);
        this.setWrapperEvents();
        setStatisticValues(this.rootNode, counter);
        this.rootNode.setAttribute("view", "month");
    }
    getWeek = async () => {
        removeExistingView(this.rootNode);
        if (this.rootNode.querySelector('button.current')) 
            this.rootNode.querySelector('button.current')!.innerHTML = `<span>${moment(this.selectedDate).format("YYYY")}</span><span>${moment(this.selectedDate).format("[W]w")}</span>`;
        
        let gridContent = "";
        let currentWeekday = parseInt(moment(this.selectedDate).format("d"));
        let weekNr = moment(this.selectedDate).format("[W]w");
        let counter = {
            due: 0,
            done: 0,
            overdue: 0,
            start: 0,
            scheduled: 0,
            recurrence: 0,
            dailyNote: 0
        }
        let current = getCurrent();
        
        const tasksPromises = [];
    
        for (let i = 0 - currentWeekday + this.firstDayOfWeek; i < 7 - currentWeekday + this.firstDayOfWeek; i++) {
            tasksPromises.push((async () => {
                let currentDate = moment(this.selectedDate).add(i, "days").format("YYYY-MM-DD");
                let dailyNotePath = this.dailyNoteFolder + "/" + currentDate;
                let weekDay = moment(this.selectedDate).add(i, "days").format("d");
                let dayName = moment(currentDate).format("ddd D.");
                let longDayName = moment(currentDate).format("ddd, D. MMM");
                
                // Filter Tasks
                let status = await getTasks(this.tasks, currentDate);
                
                // Count Events From Selected Week
                updateCounters(status, counter, currentDate);
            
                // Set New Content Container
                let cellContent;
                
                // Set Cell Name And Weekday
                let cell;
                let cls = "";
                // Set Today, Before Today, After Today
                if (currentDate < current.today) {
                    cls = "beforeToday";
                } else if (currentDate == current.today) {
                    cls = "today";
                } else if (currentDate > current.today) {
                    cls = "afterToday";
                };
                // Set Cell Name And Weekday
                if (this.taskCountOnly) {
                    cellContent = taskNumberTemplate(status.length, cls);
                } else {
                    cellContent = setTaskContentContainer(status, this.dv, currentDate);
                }
                if (parseInt(moment(this.selectedDate).add(i, "days").format("D")) == 1) {
                    cell = cellTemplate(cls, weekDay, dailyNotePath, longDayName, cellContent);
                } else {
                    cell = cellTemplate(cls, weekDay, dailyNotePath, dayName, cellContent);
                };
                    
                gridContent += cell;
            })());
        }
    
        await Promise.all(tasksPromises);
    
        let gridEl = this.rootNode.createEl("div", { cls: "grid", attr: { "data-week": weekNr } });
        gridEl.innerHTML = gridContent;
        this.rootNode.querySelector("span")!.appendChild(gridEl);
        setStatisticValues(this.rootNode, counter);
        this.rootNode.setAttribute("view", "week");
    }
    
    getList = async () => {
        removeExistingView(this.rootNode);
        this.rootNode.querySelector('button.current')!.innerHTML = `<span>${moment(this.selectedDate).format("MMMM")}</span><span>${moment(this.selectedDate).format("YYYY")}</span>`;
        let listContent = "";
        let counter = {
            due: 0,
            done: 0,
            overdue: 0,
            start: 0,
            scheduled: 0,
            recurrence: 0,
            dailyNote: 0
        }
        let monthName = moment(this.selectedDate).format("MMM").replace(".","").substring(0,3);
        
        const tasksPromises = [];
        // Loop Days From Current Month
        for (let i=0;i<parseInt(moment(this.selectedDate).endOf('month').format("D"));i++) {
            tasksPromises.push((async () =>{
                let currentDate = moment(this.selectedDate).startOf('month').add(i, "days").format("YYYY-MM-DD");
    
            // Filter Tasks
            let status = getTasks(this.tasks, currentDate);
            
            // Count Events
            updateCounters(status, counter, currentDate);
            if (moment().format("YYYY-MM-DD") == currentDate) {
                let overdueDetails = `<details open class='overdue'><summary>Overdue</summary>${setTaskContentContainer(status, this.dv, currentDate)}</details>`;
                let todayDetails = `<details open class='today'><summary>Today</summary>${setTaskContentContainer(status, this.dv, currentDate)}</details>`;
                
                // Upcoming
                let upcomingContent = "";
                for (let t=1;t<this.upcomingDays+1;t++) {
                    let next = moment(currentDate).add(t, "days").format("YYYY-MM-DD");
                    upcomingContent += setTaskContentContainer(getTasks(this.tasks,next), this.dv, next);
                };
                let upcomingDetails = `<details open class='upcoming'><summary>Upcoming</summary>${upcomingContent}</details>`;
                
                listContent += `<details open class='today'><summary><span>${moment(currentDate).format("dddd, D")}</span><span class='weekNr'>${moment(currentDate).format("[W]w")}</span></summary><div class='content'>${overdueDetails}${todayDetails}${upcomingDetails}</div></details>`
                
            } else {
                listContent += `<details open><summary><span>${moment(currentDate).format("dddd, D")}</span><span class='weekNr'>${moment(currentDate).format("[W]w")}</span></summary><div class='content'>${setTaskContentContainer(status, this.dv, currentDate)}</div></details>`
            }
            })());
        }
        await Promise.all(tasksPromises);
        let listContentEl = this.rootNode.createEl("div", {cls: "grid list"});
        listContentEl.innerHTML = listContent;
        listContentEl.setAttribute("data-month", monthName);
        this.rootNode.querySelector("span")!.appendChild(listContentEl);
        setStatisticValues(this.rootNode, counter);
        this.rootNode.setAttribute("view", "list");
        
        // Scroll To Today If Selected Month Is Current Month
        if ( moment().format("YYYY-MM") == moment(this.selectedDate).format("YYYY-MM") ) {
            let listElement = this.rootNode.querySelector(".list")!;
            let todayElement = this.rootNode.querySelector(".today")! as HTMLElement;
            let scrollPos = todayElement.offsetTop - todayElement.offsetHeight + 85;
            listElement.scrollTo(0, scrollPos);
        }
    }
    setWrapperEvents = ()  =>{
        this.rootNode.querySelectorAll('.wrapperButton').forEach(wBtn => wBtn.addEventListener('click', (() => {
            let week = parseInt(wBtn.getAttribute("data-week")!);
            let year = wBtn.getAttribute("data-year");
            this.selectedDate = moment(moment(year).add(week - 1, "weeks")).startOf("week");
            this.rootNode.querySelector(`.grid`)!.remove();
            this.getWeek();
        })));
    }
}