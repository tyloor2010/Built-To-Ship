# Project 

Build a complete production-quality SaaS web application called:

"PROJECT COMMAND"

Tagline:

"Run projects. Align teams. Ship faster."

This is NOT a landing-page-only project and NOT a simple dashboard.

It must be a complete project management platform with:

- Marketing website

- Authentication

- User onboarding

- Workspace

- Projects

- Tasks

- Team management

- Project timelines

- Activity logs

- Files

- Comments

- Notifications

- Analytics

- AI project assistant

- Settings

- Responsive mobile experience

====================================================

IMPORTANT DESIGN REFERENCE

====================================================

Use the uploaded reference image as the PRIMARY visual design inspiration.

DO NOT copy its SAT branding, SAT text, or educational content.

Instead, reproduce the SAME visual language and design philosophy:

- Off-white / warm white background

- Very subtle dotted grid background pattern

- Bold black typography

- Electric blue as the primary accent

- Bright lime green as the secondary accent

- Occasional purple/orange accent colors

- Very thick black borders

- Large rounded corners

- Chunky editorial typography

- Oversized headings

- Playful but premium SaaS aesthetic

- Sticker-like badges

- Hand-drawn visual elements

- Organic blobs / stars / arrows / bursts

- Strong visual hierarchy

- High contrast

- Slightly oversized UI elements

- Black offset shadows

- Cards that feel physical and tactile

- Buttons with thick borders and subtle offset shadows

- Minimal gradients

- NO generic corporate SaaS look

- NO glassmorphism

- NO excessive blur

- NO boring gray dashboard UI

- NO generic Bootstrap appearance

The website should feel like:

"Modern startup + creative agency + premium productivity tool"

It should be visually bold, memorable, playful and highly polished.

====================================================

DESIGN SYSTEM

====================================================

Primary background:

#F8F7F2 / warm off-white

Primary text:

#080B12

Primary accent:

Electric Blue #1557FF

Secondary accent:

Lime Green #B8FF00

Optional accents:

Purple

Orange

Red

Borders:

2px–3px solid near-black

Border radius:

18px–28px for major cards

12px–18px for smaller controls

Shadows:

Use strong offset black shadows.

Example:

box-shadow: 5px 5px 0px #080B12;

Buttons should feel tactile:

- thick border

- offset shadow

- hover moves slightly toward the shadow

- active state removes/reduces shadow

Typography:

Use a bold modern geometric sans-serif.

Headings should be extremely bold and editorial.

Use oversized typography for hero sections.

Do NOT use thin elegant typography.

====================================================

GLOBAL VISUAL LANGUAGE

====================================================

Create a reusable design system.

Every page must feel like the same product.

Use:

- dotted backgrounds

- sticker badges

- black outlines

- offset shadows

- blue highlights

- lime status indicators

- playful illustrations

- oversized headings

- compact metadata

- strong cards

Create reusable components:

Button

Badge

Sticker

Card

StatCard

ProjectCard

TaskCard

Avatar

AvatarGroup

ProgressBar

StatusPill

Modal

Drawer

Dropdown

Tooltip

Tabs

CommandPalette

Toast

EmptyState

ConfirmationDialog

DataTable

Timeline

ActivityItem

All components must follow the same design system.

====================================================

PUBLIC MARKETING WEBSITE

====================================================

Create a beautiful landing page.

Navigation:

Logo:

PROJECT

COMMAND

Navigation:

Features

How it works

Solutions

Pricing

Right side:

Sign in

Start free →

Hero section:

Small lime sticker:

"BUILT TO SHIP"

Large headline:

"RUN PROJECTS.

SHIP FASTER."

Highlight "FASTER." in electric blue.

Supporting text:

"One powerful workspace for projects, teams, tasks, deadlines and everything you need to turn ideas into shipped work."

Buttons:

"Start free →"

"See how it works"

Below buttons:

"No credit card"

"Free workspace"

"Built for modern teams"

Hero visual:

Create a large product preview showing the actual PROJECT COMMAND interface.

The preview should look like a real application, not a fake generic dashboard.

Add playful decorative elements around it:

- lime starburst

- arrows

- small stickers

- handwritten-style labels

- blue shapes

====================================================

FEATURES SECTION

====================================================

Heading:

"EVERYTHING YOUR TEAM NEEDS TO SHIP."

Create bold feature cards:

01

PROJECTS

"Everything stays organized in one place."

02

TASKS

"Know exactly what needs to happen next."

03

TEAM

"See who's doing what and keep everyone aligned."

04

TIMELINE

"Never lose track of important deadlines."

05

ANALYTICS

"Turn project activity into useful insights."

06

AI COMMANDER

"Ask your workspace questions and get instant answers."

Each card should have a unique visual treatment while remaining inside the same design system.

====================================================

HOW IT WORKS

====================================================

3 large steps:

01

CREATE

Create your workspace and projects.

02

ORGANIZE

Assign tasks, deadlines and responsibilities.

03

SHIP

Track progress and get everything across the finish line.

Use large typography and visual connectors/arrows.

====================================================

PRICING

====================================================

Create pricing section:

FREE

$0

For individuals and small projects.

PRO

$12 / user / month

For growing teams.

TEAM

$25 / user / month

For serious organizations.

Use:

- bold pricing cards

- black borders

- offset shadows

- lime "MOST POPULAR" sticker

- blue CTA buttons

====================================================

AUTHENTICATION

====================================================

Implement real authentication.

Pages:

/login

/signup

/forgot-password

/reset-password

Support:

- email/password

- Google OAuth if backend supports it

After signup:

Create onboarding flow.

====================================================

ONBOARDING

====================================================

Ask:

"What should we call your workspace?"

"What are you working on?"

"How big is your team?"

Options:

1

2–5

6–20

21–50

50+

Then:

"What's your main goal?"

Options:

- Manage projects

- Manage a team

- Track clients

- Plan launches

- Organize operations

Create workspace automatically.

====================================================

APPLICATION LAYOUT

====================================================

After login, use a completely different application layout while preserving the SAME visual identity.

Desktop:

Left sidebar

Top command bar

Main content

Sidebar:

PROJECT COMMAND logo

Workspace selector

MAIN

Overview

Projects

My Tasks

Calendar

Team

Files

INSIGHTS

Analytics

Reports

AI Commander

BOTTOM

Notifications

Settings

Help

Sidebar should have:

- warm off-white background

- thick borders

- active item with electric blue background

- lime notification indicators

- rounded active states

Do NOT use a generic dark admin sidebar.

====================================================

OVERVIEW PAGE

====================================================

Route:

/app

Header:

"GOOD MORNING, ALEX."

Subtitle:

"Here's what's happening across your workspace."

Top right:

+ New Project

+ New Task

Stats:

Active Projects

12

Tasks Due

28

Team Members

18

Completion Rate

84%

Use bold cards with:

- thick black borders

- offset shadows

- blue/lime accents

Main section:

"PROJECT PULSE"

Display project progress.

Each project:

Project name

Owner

Progress

Deadline

Status

Team avatars

====================================================

PROJECTS

====================================================

Route:

/app/projects

Display projects in a visually rich grid.

Each project card contains:

Project name

Description

Status

Progress

Deadline

Task count

Team avatars

Example:

Website Redesign

Marketing website redesign for Q4.

78%

Due Aug 24

12 tasks

5 members

Statuses:

Planning

Active

At Risk

Completed

Archived

Allow:

- search

- filter

- sort

- grid/list toggle

====================================================

CREATE PROJECT

====================================================

Create project modal/page.

Fields:

Project name

Description

Project color

Start date

Deadline

Owner

Team members

Templates:

Website Launch

Product Development

Marketing Campaign

Research Project

Client Project

Custom

On creation:

Automatically create project workspace.

====================================================

PROJECT DETAIL

====================================================

Route:

/app/projects/:projectId

Header:

Project name

Status

Owner

Deadline

Tabs:

Overview

Tasks

Timeline

Files

Activity

Team

Overview:

Project progress

Health status

Upcoming deadlines

Recent activity

Team workload

Add a large "PROJECT HEALTH" component.

Health states:

ON TRACK

AT RISK

OFF TRACK

Use visual indicators.

====================================================

TASK MANAGEMENT

====================================================

Route:

/app/tasks

Support:

Create task

Edit task

Delete task

Assign task

Change status

Set priority

Set deadline

Add labels

Add subtasks

Comments

Attachments

Task statuses:

Backlog

Todo

In Progress

Review

Done

Priority:

Low

Medium

High

Urgent

Views:

List

Kanban

Calendar

Kanban should have tactile cards with thick borders and shadows.

====================================================

KANBAN

====================================================

Columns:

BACKLOG

TODO

IN PROGRESS

REVIEW

DONE

Tasks should be draggable.

Each task card:

Task title

Priority badge

Assignee avatar

Due date

Comments

Attachments

Subtask progress

Use drag and drop.

====================================================

CALENDAR

====================================================

Route:

/app/calendar

Show:

Monthly calendar

Weekly calendar

Upcoming deadlines

Projects and tasks should appear visually.

Use blue and lime indicators.

====================================================

TEAM

====================================================

Route:

/app/team

Display team members.

Each member:

Avatar

Name

Role

Active projects

Tasks

Workload

Status

Statuses:

Available

Busy

Away

Create:

Invite member

Member detail drawer:

Tasks

Projects

Activity

Workload

====================================================

FILES

====================================================

Route:

/app/files

File manager.

Support:

- upload

- folders

- search

- sort

- preview

- download

- delete

File types:

PDF

DOC

XLS

PNG

JPG

ZIP

Show beautiful file cards.

====================================================

ACTIVITY

====================================================

Create activity timeline.

Examples:

"Sarah completed Website Homepage"

"Alex created a new project"

"Mike moved API Integration to Review"

"John uploaded project brief"

Every activity includes:

Avatar

Action

Timestamp

====================================================

NOTIFICATIONS

====================================================

Create notification center.

Types:

Task assigned

Task due

Mention

Project update

Deadline warning

Team invitation

Unread notifications should have lime indicators.

====================================================

ANALYTICS

====================================================

Route:

/app/analytics

Create useful project analytics.

Metrics:

Project completion rate

Tasks completed

Tasks overdue

Average completion time

Team workload

Projects at risk

Charts should follow the design system.

Avoid generic boring dashboard charts.

Use large editorial chart cards with bold numbers.

====================================================

AI COMMANDER

====================================================

This is one of the most important features.

Create an AI workspace assistant.

Route:

/app/ai

Interface:

Large command-center style AI interface.

Heading:

"ASK YOUR WORKSPACE."

Examples:

"Which projects are at risk?"

"What's blocking the Website Redesign?"

"Who has the most overdue tasks?"

"What should our team focus on today?"

"Summarize this week's activity."

"Which deadlines are coming up?"

AI should use actual workspace/project/task data when backend integration is available.

Create suggested prompts as clickable cards.

AI response should be displayed in a clean conversational interface.

Include:

- conversation history

- clear chat

- suggested prompts

- loading state

- error state

====================================================

COMMAND PALETTE

====================================================

Add global keyboard command palette.

Shortcut:

⌘ K

or

Ctrl K

Commands:

Create project

Create task

Search projects

Search tasks

Go to analytics

Open AI Commander

Invite member

Open settings

This should feel extremely polished.

====================================================

SEARCH

====================================================

Global search.

Search:

Projects

Tasks

People

Files

Show grouped results.

Keyboard navigation.

====================================================

SETTINGS

====================================================

Routes:

/app/settings/profile

/app/settings/workspace

/app/settings/members

/app/settings/notifications

/app/settings/security

/app/settings/billing

Profile:

Name

Avatar

Email

Role

Workspace:

Workspace name

Logo

Timezone

Default settings

Notifications:

Email notifications

Task notifications

Deadline reminders

Mentions

Security:

Password

Sessions

Login activity

Billing:

Plan

Usage

Invoices

Upgrade

====================================================

DATABASE

====================================================

Use a real backend/database if available.

Create proper relational data models.

Tables/entities:

users

workspaces

workspace_members

projects

project_members

tasks

task_assignees

subtasks

comments

attachments

activity_logs

notifications

files

labels

project_labels

calendar_events

subscriptions

Every record must belong to the correct workspace.

Implement proper workspace isolation.

Users must NEVER be able to access another workspace's data.

====================================================

PERMISSIONS

====================================================

Roles:

Owner

Admin

Member

Viewer

Owner:

Everything

Admin:

Manage projects, members and settings

Member:

Create/edit projects and tasks

Viewer:

Read-only access

Enforce permissions both in UI and backend/database policies.

====================================================

REAL FUNCTIONALITY

====================================================

DO NOT create fake buttons.

Every important action must actually work.

Examples:

Create project → saves project

Create task → saves task

Assign task → updates assignee

Move Kanban task → updates status

Invite member → creates invitation

Upload file → stores file

Comment → persists comment

Notification → persists notification

Search → searches real data

Analytics → calculated from real data

AI → uses workspace context where possible

====================================================

RESPONSIVE DESIGN

====================================================

Desktop:

Premium full application experience.

Tablet:

Adaptive layout.

Mobile:

Bottom navigation or collapsible sidebar.

All pages must work perfectly on mobile.

Do not simply shrink desktop UI.

Create proper mobile layouts.

====================================================

MICRO INTERACTIONS

====================================================

Add polished interactions:

Buttons:

hover

active

focus

Cards:

subtle hover movement

Page transitions:

subtle

Modals:

smooth entrance

Notifications:

slide/fade

Kanban:

drag animations

Progress:

animated

Do not over-animate.

Keep it fast and premium.

====================================================

EMPTY STATES

====================================================

Every empty page needs a designed empty state.

Example:

"No projects yet."

"Let's build something."

[Create project →]

Use playful illustrations/stickers consistent with the design system.

====================================================

LOADING STATES

====================================================

Use skeleton loaders.

Do NOT show blank white screens.

====================================================

ERROR STATES

====================================================

Create friendly error states.

Example:

"Something went sideways."

"Try again."

[Retry]

====================================================

ACCESSIBILITY

====================================================

Implement:

Keyboard navigation

Visible focus states

Semantic HTML

ARIA labels

Accessible forms

Good contrast

Screen reader support

====================================================

PERFORMANCE

====================================================

Optimize:

Images

Fonts

Bundle size

Database queries

Lazy loading

Avoid unnecessary re-renders.

====================================================

CODE QUALITY

====================================================

Use:

React

TypeScript

Tailwind CSS

Reusable components

Clean architecture

Keep components modular.

Do not put the entire application in one huge file.

Use proper route organization.

Use reusable hooks and utilities.

====================================================

IMPORTANT DESIGN RULES

====================================================

NEVER fall back to:

- Generic admin dashboard

- Dark sidebar with gray cards

- Glassmorphism

- Excessive gradients

- Tiny typography

- Thin borders

- Generic blue SaaS template

- Default component-library appearance

The visual identity must remain:

BOLD

PLAYFUL

TACTILE

EDITORIAL

PREMIUM

TECHNICAL

The uploaded reference is the visual benchmark.

If a design decision conflicts with the reference's visual language,

prefer the reference's visual language.

====================================================

FINAL QUALITY BAR

====================================================

The result should look like a real funded SaaS startup.

It should be something that could be shown in:

- Product Hunt

- Startup demo day

- Portfolio

- Client presentation

- Hackathon

- Investor demo

Every page should feel intentionally designed.

No placeholder-looking UI.

No unfinished pages.

No dead buttons.

No fake functionality where real functionality can be implemented.

Build the complete application end-to-end.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://mo-project-command.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/42565480-8369-40fa-a782-2dc468cd5136).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
