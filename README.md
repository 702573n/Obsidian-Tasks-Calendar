# Taskido: Obsidian-Tasks-Timeline
## [Click here!](https://github.com/702573N/Obsidian-Tasks-Timeline)

<p align="center"><img width="400" alt="Semi_Transparent" src="https://user-images.githubusercontent.com/59178587/210307060-5ed916ee-819d-46b1-9a5e-efdd15728957.png"></p>

---

# Obsidian-Tasks-Calendar
#### A custom view build with [Obsidian-Dataview](https://github.com/blacksmithgu/obsidian-dataview) to display tasks from [Obsidian-Tasks](https://github.com/obsidian-tasks-group/obsidian-tasks) and from your daily notes in a highly customisable calendar with a wide variety of views

![light](https://user-images.githubusercontent.com/59178587/203789595-ede6138f-2c29-4148-b52f-874ab3ea43f7.png)

## Story
All Obsidian and Task Plugin users love the program. What has been set up with the Task Plugin is just great and helps so many people to organize their work. However, just listing tasks according to certain criteria is sometimes a bit boring. To get a quick visual impression of one's workday/workweek/workmonth, a calendar view would be ideal. To be honest, I'm too stupid to program my own plugins for Obsidian, but I know some Javascript, so I programmed this Dataview snippet. I hope to offer many people a good addition to the Task Plugin and hope for an integration into the Task Plugin someday. But I'm sure there are better programmers out there, who can make my code, which is probably horrible for professionals, much better.

## Setup
1.  Install "Dataview Plugin" from the external plugins

![Tree Demo](https://user-images.githubusercontent.com/59178587/203789303-4474847e-ab84-4f33-8665-c17ca887ec79.png)

3.  Create a new note or edit an existing one and add the following code line:

    ````
    ```Calendar
    pages: ""
    view: month
    firstDayOfWeek: 1
    options: style1
    ```
    ````
    
    If you paste the main files (js/css) into another folder then "tasksCalendar", you have to replace the name between the first quotation marks.
 
 4. There are 4 different variables to set path/location as "pages", calendar view style as "view", first day of the week (0 or 1) as "firstDayOfWeek" and some style classes as "options"

---
## Required parameters

### pages:

For help and instruction take a look here [Dataview Help](https://blacksmithgu.github.io/obsidian-dataview/api/code-reference/#dvpagessource)

```
pages: ""
```
Get all tasks from all notes in obsidian.

```
pages: "Task Management/Work"
```
Set a custom folder to get tasks from.

The dv.pages command is the same and works exactly the same like in dataview-plugin.

```
pages: "dv.pages().file.tasks.where(t => t.tags.includes('#Pierre'))"
pages: "dv.pages().file.tasks.where(t=>!t.checked && t.header.subpath != 'Log')"
pages: "dv.pages().file.where(f=>f.tags.includes('#ToDo') || f.tags.includes('#Task')).where(f=>f.folder != 'Inbox').tasks"
```
It is also possible to define complex queries. These must start with `dv.pages` and output tasks as a result.
    

### view:
```
view: list
view: month
view: week
```
With the view parameter you can set the default calendar view.
  

### firstDayOfWeek:
```
firstDayOfWeek: 1
firstDayOfWeek: 0
```
Set monday (1) or sunday (0) as first day of week


### options:
```
options: style1
```
You have multiple options to personalize your Tasks-Calendar. The absolutelely must have is to set a custom week view style (style1, style2, ...) as your default week view style. However, you can switch between the individual styles at any time in the calendar itself by clicking the week view button again if this view is active.

<img width="1982" alt="Style-switcher" src="https://user-images.githubusercontent.com/59178587/203786071-eb97d99d-507b-4a92-9812-ba5cf6fd66ad.png">

But that's not all. With the options parameter you can hide things you don't need or like, get a mini version of the calendar and many more...

```
options: noIcons
```
Hide the task icons in front of each task.

```
options: noProcess
```
By default the Tasks-Calendar show up tasks with a start- and a due-date on all days between these two like a calendar app displays all-day events across all days from the first to the last day. If you don't like this, you can turn it off with the `noProcess` option.

```
options: noDailyNote
```
Hide daily notes inside calendar

Some users do not use the Task plugin, but work mainly with daily notes. To enable these users to use the functionality of this calendar, all tasks from daily notes are displayed on the respective date of the daily note. As some task plugin users may also work with daily notes, some may find it annoying to see them in the calendar as well between all Task plugin stuff. With the option `noDailyNote` you can hide all tasks (without any Task plugin date syntax) from your calendar.

```
options: noCellNameEvent
```
By default you can click on each cell name to jump directly into the daily note. If no daily note with this date exist, a new one will be created. This is nice for hardcore daily note users, but for others it could be annoying. To prevent unintentional execution you can disable the cell name click-events with the option `noCellNameEvent`.

```
options: mini
```
Reduces the calendar width, height and font sizes to a more compact format. This can be used to embed the calendar into a complex sidebar in Obsidian.
On mobile devices, the font size is automatically reduced (on some views) because the limited screen size.

```
options: noWeekNr
```
Hide the week number in front of each week-wrapper inside the month calendar. After deactivation, it is unfortunately no longer possible to jump directly to a desired week.

```
options: noFilename
```
Hides the task header line with the note file name

```
options: lineClamp1
options: lineClamp2
options: lineClamp3
options: noLineClamp
```
Set a line clamp from 1-3 inside your displayed tasks. By default 1 line is set. Alternative you can disable line clamp and show full task description text.

```
options: noLayer
```
The back layer of the grid with the month or week information can be hidden with this.

```
options: noOverdueDays
```
You can use this option to hide the overdue days flag on overdue tasks.

### Optional parameters

#### dailyNoteFolder:
```
dailyNoteFolder: MyCustomFolder
dailyNoteFolder: Inbox/Daily Notes/Work
```
This parameter must only be specified if this is to be used. Here you can define a custom folder path for the daily notes if they should not be saved in the default folder for new files. Of course, folder structures with several levels can also be defined here. This paramter 

#### dailyNoteFormat:
```
dailyNoteFormat: YYYY, MMMM DD - dddd
dailyNoteFormat: YYYY-[W]ww
```
This parameter must only be specified if this is to be used. Without this parameter the default format "YYYY-MM-DD" is used to identify your daily notes. You can set a custom format with a limited base set of characters: Y M D [W] ww d . , - : (SPACE)

#### startPosition:

Month: 2022 - December
```
view: month
startPosition: 2022-12
```

Week: 2022 - W50
```
view: week
startPosition: 2022-50
```
This parameter is optional and can be used to set a custom month or week to give focus after load. The default format on month view is `YYYY-MM`and on week view `YYYY-ww`. The first 4 digits represents the year and the last 1-2 digits represents the month or the week. Both must be separated with a minus character.

#### globalTaskFilter:
```
globalTaskFilter: #task
```
This parameter must only be specified if this is to be used. Set a global task filter to hide from task text/description inside tasks-calendar.

#### css:
```
css: .tasksCalendar.style4[view='week'] .grid { height: 300px !important }
```
Now you can write custom css rules inside a css parameter. Please use the developer console to identify the elements classes! Each style string should start with .tasksCalendar to avoid css conflicts!

#### taskCountOnly
```
taskCountOnly: true
```
This parameter displays only the number of tasks on each days

#### disableRecurrence
```
disableRecurrence: true
```
Now you can see the recurring tasks every days they will appear in the future, not only the current day, if you want to disable this new feature set this parameter to `true`

#### hideFileWithProps
```
hideFileWithProps: Archived, Handled By
```
This filter will remove the tasks that are not checked and present in a file with a mentionned property, as `Archived` or `Handled By` in this example

---

## Note colors and icon
In each note file you can define custom "color" and "icon" to show up in the calendar. To do so, you only need to add the following metadata to the first line of your note. By default the note-color is used for the dimmed background and as text-color. If you would like to give your tasks a completely different color then the note-color itself, then use the textColor meta.

```
---
color: #bf5af2
textColor: #000000
icon: ❤️
---
```
    
The color should be hex in quotation marks to work properly. This color is set for text and as semi-transparent background. The icon itself is placed in front of the task filename header.

![Note Color Demo](https://user-images.githubusercontent.com/59178587/203788233-555edbc4-915c-499c-bdf4-87c6030bfd55.png)

---

## Filter
On the upper left corner of each calendar-view is a filter-icon to show or hide all done and cancelled tasks. The default-filter is set by options. If you have `filter` inside your options parameter, the filter is enabled by default.

![Filter Demo](https://user-images.githubusercontent.com/59178587/203787018-483bf485-3ce5-43b4-99ae-2a3a8efbf690.png)

---

## Statistic and focus

On the upper right corner is statistic button which opens a detailed list of all your tasks for the currently selected month/week. By selecting a task type you can focusing this tasks and dimm out all others. This way you can find the tasks you are looking for more easily.

Through a meaningful icon and a counter, you can quickly get an overview of incompleted tasks within the selected month/week without opening the pop-up window.

![Focus Demo](https://user-images.githubusercontent.com/59178587/203786131-6ddf1389-8b66-4f3c-9d7a-121c5fe38540.png)


# Taskido: Obsidian-Tasks-Timeline
#### A custom view build with [Obsidian-Dataview](https://github.com/blacksmithgu/obsidian-dataview) to display tasks from [Obsidian-Tasks](https://github.com/obsidian-tasks-group/obsidian-tasks) and from your daily notes in a highly customisable timeline

<p align="center"><img width="400" alt="Semi_Transparent" src="https://user-images.githubusercontent.com/59178587/210307060-5ed916ee-819d-46b1-9a5e-efdd15728957.png"></p>

- All your tasks in a clean and simple timeline view
- Focus today and filter to do, overdue or unplanned tasks
- Quick add new tasks without having to open notes
- Forward tasks from past days to today
- Relative dates for quicker classification
- Scratch tasks to your inbox for better time management
- Custom colors for all your tags and notes

---

## Story
Many Obsidian and Task Plugin users need to build certain queries using the Dataview Plugin, or with the queries included in the Task Plugin. These queries then allow the user to keep track of certain previously defined tasks. The visual representation of the query result is very plain and rigid, as are the customisation options for the display. The aim of this customised view is to make almost all of the user's tinkered queries redundant with an all-round solution.

Although I initially developed the Obsidian Tasks Calendar, I now work exclusively with the Timeline, as it shows me all the information at any given time without overwhelming me.

---

## Setup
1.  Install "Dataview Plugin" from the external plugins
2.  Create a new folder called "Taskido" or any other name and paste the files "view.js" and "view.css" into it
3.  Create a new note or edit an existing one and add the following code line:

    ````
    ```Taskido
    pages:""
    ```
    ````
    
    If you paste the main files (js/css) into another folder then "Taskido", you have to replace the name between the first quotation marks.
 
 4. There are more parameters to customize the look and feel of Taskido but there aren't necessary.
 
    Parameters must be declared in the curly bracket and all parameters are separated by a comma. The name of the parameter is followed by a colon, a space and quotes in which the corresponding value of the parameter is declared.

    The options parameter is the only parameter to which multiple values (separated by a space (no comma)) can be assigned. The values declared in options function as style classes within the CSS (Cascading Style Sheet) and primarily serve to hide elements when they are not needed.
    
    True and false values are always declared without quotes.

    All this together results in the following structure:
    
    ````
    ```Taskido
    parameter: "value"
    parameter: "value"
    parameter: true
    parameter: "value value value value"
    ```
    
    For example...
    
    ```Taskido
    pages: ""
    select: "Task Management/Inbox.md"
    inbox: "Task Management/Inbox.md"
    dailyNoteFolder: "Daily Notes"
    forward:true, options: ""
    ```
    ````

---

## Required parameter

### pages:
For help and instruction take a look here [Dataview Help](https://blacksmithgu.github.io/obsidian-dataview/api/code-reference/#dvpagessource)
```
pages: ""
```
Get all tasks from all notes in obsidian.

```
pages: '"Task Management/Work"'
```
Set a custom folder to get tasks from.

The dv.pages command is the same and works exactly the same like in dataview-plugin.

```
pages: "dv.pages().file.tasks.where(t => t.tags.includes('#Pierre'))"
pages: "dv.pages().file.tasks.where(t=>!t.checked && t.header.subpath != 'Log')"
pages: "dv.pages().file.where(f=>f.tags.includes('#ToDo') || f.tags.includes('#Task')).where(f=>f.folder != 'Inbox').tasks"
```
It is also possible to define complex queries. These must start with `dv.pages` and output tasks as a result.

---

## Optional parameters
```
options: "noCounters"
options: "noQuickEntry"
options: "noYear"
options: "noRelative"
options: "noRepeat"
options: "noPriority"
options: "noTag"
options: "noFile"
options: "noHeader"
options: "noInfo"
options: "noDone"
```
With this options you can hide some elements which they do not need, or which disturb.

### Combining options
```
options: "noCounters noQuickEntry noInfo"
```
All options can be combined with each other as desired.

### Focus/Filter options
```
options: "todayFocus"
```
With this option you can set default focus on today after open the timeline.

```
options: "todoFilter"
options: "overdueFilter"
options: "unplannedFilter"
```

With this options you can set a default filter after open the timeline.

### dailyNoteFolder:
```
dailyNoteFolder: "MyCustomFolder"
dailyNoteFolder: "Inbox/Daily Notes/Work"
```
Here you can set a custom folder path for the daily notes if they should not be saved in the default folder for new files. Of course, folder structures with several levels can also be defined here.

### dailyNoteFormat:
```
dailyNoteFormat: "YYYY, MMMM DD - dddd"
dailyNoteFormat: "YYYY-[W]ww"
```
You can set a custom format with a limited base set of characters: Y M D [W] ww d . , - : (SPACE). Without this parameter the default format "YYYY-MM-DD" is used to identify your daily notes.

### section:
```
section: "## Tasks"
```
You can set the section within the notes file to append new tasks. The example above will append tasks in your notes under the section `## Tasks`.  The match should be exact. Without this parameter, new tasks are appended at the end of the file.

### globalTaskFilter:
```
globalTaskFilter: "#task"
```
Set a global task filter to hide from task text/description inside tasks-calendar.

### sort:
```
sort: "t=>t.order"
sort: "t=>t.text"
sort: "t=>t.completed"
sort: "t=>t.priority"
```
With the sort paramter you can set your personal sort algorithm to sort your tasks inside a day.

### forward:
```
forward: true
```
This parameter carry forward tasks from past and display them on the current date.

### dateFormat:
```
dateFormat: "YYYY-MM-DD"
dateFormat: "ddd, MMM D"
```
With this parameter you can set a custom date format with moment.js syntax. By default the format "ddd, MMM D" is set.

### select:
```
select: "Task Management/Inbox.md"
```
With this parameter you can set a default file selection for the quick entry panel. By default Taskido select the daily note from today, even if this does not yet exist. By pushing a task into it, the daily note is created automatically.

### inbox:
```
inbox: "Task Management/Inbox.md"
```
With this parameter you can set a custom file as your Inbox to scratch tasks first before moving them into the correct note file (GTD). All tasks from within this file are listed on today, even if the tasks have not yet been assigned a date at all. In this way, tasks can be recorded quickly without having to be fully formulated. So you can return to your actual activities and complete the follow-up of the tasks at a later and more appropriate time.

### taskFiles:
```
taskFiles: "" => files with uncompleted tasks (set by default without declaring this parameter)
taskFiles: "#taskido" => files with tag #taskido
taskFiles: '"Task Management/Work"' => files in folder Task Management
taskFiles: '("Task Management" and -"Task Management/Archive")' => folder Task Management without folder Task Management/Archive
taskFiles: '"Task Management" or #taskido' files in folder Task Management or files with tag #taskido
```
With this parameter you can select files to show up inside quick entry select box.

---

## Note colors
In each note file you can set a custom "color" to show up in the calendar. You only need to add the following metadata to the first line of your note.

<img width="570" alt="Bildschirm­foto 2023-01-02 um 12 17 47" src="https://user-images.githubusercontent.com/59178587/210224314-5a54180f-1c63-490c-8c37-aaff7bb4d707.png">
    
The color should be hex in quotation marks to work properly.

<img width="362" alt="Bildschirm­foto 2023-01-02 um 12 16 25" src="https://user-images.githubusercontent.com/59178587/210224367-31ddc0d2-0ec5-497f-ae22-5ab2be508571.png">

---

## Tag colors
You can set a custom color for all your tags displayed inside Taskido. Here I'm using the nesting tag feature to implement this. The first tag (root-node) is used as hex-color and the second tag after the slash is your main tag:

    `#0a84ff/demo`

If Taskido can identify the first tag as a hex-color, your tag get this as custom var(--tag-color) and var(--tag-background). The hex-color isn't visible on the displayed tag itself because it will be replaced.

The tag-autocomplete functionality inside Obsidian makes it possible to quickly find and re-use an existing tag without typing the hex-color first. This is realy cool and I hope the Obsidian founders will implement this in future.

<img width="183" alt="Bildschirm­foto 2023-01-02 um 11 50 05" src="https://user-images.githubusercontent.com/59178587/210222128-f892d87a-7a2b-4553-a8a6-b5d3d4dd3b51.png">

<img width="311" alt="Bildschirm­foto 2023-01-07 um 09 02 03" src="https://user-images.githubusercontent.com/59178587/211140582-ba3c79d4-7504-42da-ab4b-1886c2c112c0.png">

**Small Color Palette**
```
#ff443a/red #ff9d0a/orange #ffd60a/yellow #30d158/green #66d4cf/mint #40c8e0/teal #64d3ff/cyan #0a84ff/blue #5e5ce6/indigo #bf5af2/purple #ff375f/pink #ac8f68/brown
```
---
### disableRecurrence
```
disableRecurrence: true
```
Now you can see the recurring tasks every days they will appear in the future, not only the current day, if you want to disable this new feature set this parameter to `true`

--- 
### hideFileWithProps
```
hideFileWithProps: Archived, Handled By
```
This filter will remove the tasks that are not checked and present in a file with a mentionned property, as `Archived` or `Handled By` in this example

---
### numberOfDays
```
numberOfDays: 5
```
Choose the number of days you want to view in the future in your timeline

---

## Filter
A small separation give focus on today. Three info boxes (To Do, Overdue, Unplanned
) give you all necessary informations to do your best on today. By clicking on each box, your selected tasks get filtered. By clicking on the "Today" header you can also hide all other days from timeline.

<img width="358" alt="Bildschirm­foto 2023-01-02 um 12 04 05" src="https://user-images.githubusercontent.com/59178587/210223039-094b6586-fdb4-4628-b9f7-863034ec2b33.png">


---

## Quick entry panel

<img width="462" alt="Bildschirm­foto 2023-01-12 um 20 45 52" src="https://user-images.githubusercontent.com/59178587/212165875-a1af22e7-ff74-4267-a802-da64da541160.png">

Quick entry panel to write new tasks and push directly into custom note file. All currently used notes with active tasks were listed in a select box on top of the quick entry panel. The todays daily note is pinned to that list too, even if this file doesn't exist at that moment. If you push a task to that file, the file will be created at that moment. In order to simplify the recording of tasks, some autotext shortcuts have been programmed. The following text snippets will be replaced automatically to Task Plugin syntax:

### Symbol snippets
```
due > 📅
start > 🛫
scheduled > ⏳
done > ✅
high > ⏫
medium > 🔼
low > 🔽
repeat > 🔁
recurring > 🔁
```

### Date snippets

To get yesterday, today, or tomorrow, simply type...
```
today
tomorrow
yesterday
```

If you would like to get the date of the next upcoming weekday by name...
```
monday
tuesday
wednesday
thursday
friday
saturday
sunday
```

Relative dates in the below format can also be converted into YYYY-MM-DD format...
```
in X days/weeks/month/years

for example:

in 3 weeks
or
in 1 year
```

---