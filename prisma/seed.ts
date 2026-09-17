/**
 * Development seed script.
 *
 * Safe to run any time: it upserts labels (never duplicates them) and only
 * adds demo tasks if the tasks table is empty, so re-running this against a
 * database that already has real tasks in it won't touch them.
 *
 * Usage:  npm run db:seed
 * Full reset instead (DELETES ALL DATA):  npm run db:reset
 */
import { PrismaClient, Priority } from "@prisma/client";

const prisma = new PrismaClient();

const DEFAULT_LABELS: { name: string; icon: string }[] = [
  { name: "YouTube Video", icon: "🎬" },
  { name: "Coding Task", icon: "💻" },
  { name: "House Work", icon: "🏠" },
  { name: "Personal", icon: "🌱" },
  { name: "Shopping", icon: "🛒" },
  { name: "Study", icon: "📚" },
  { name: "Health", icon: "💪" },
  { name: "Work", icon: "💼" },
  { name: "Other", icon: "📌" },
];

const DEMO_TASKS: {
  title: string;
  description?: string;
  label: string;
  priority: Priority;
}[] = [
  {
    title: "Record today's YouTube video",
    description: "Script is ready — just need the B-roll and voiceover.",
    label: "YouTube Video",
    priority: "HIGH",
  },
  {
    title: "Finish portfolio section",
    description: "The projects grid on the new site.",
    label: "Coding Task",
    priority: "NORMAL",
  },
  {
    title: "Buy groceries",
    description: "Milk, eggs, coffee, and something for dinner.",
    label: "Shopping",
    priority: "NORMAL",
  },
  {
    title: "Clean bedroom",
    label: "House Work",
    priority: "LOW",
  },
  {
    title: "Complete coding practice",
    description: "Today's set on the practice site.",
    label: "Coding Task",
    priority: "HIGH",
  },
];

async function main() {
  console.log("Seeding labels…");
  for (const label of DEFAULT_LABELS) {
    await prisma.label.upsert({
      where: { name: label.name },
      update: { icon: label.icon },
      create: label,
    });
  }

  const existingTaskCount = await prisma.task.count();
  if (existingTaskCount > 0) {
    console.log(
      `Skipping demo tasks — ${existingTaskCount} task(s) already exist. ` +
        `Delete them from the app (or run "npm run db:reset") if you want a clean slate.`
    );
    return;
  }

  console.log("Seeding demo tasks…");
  for (let i = 0; i < DEMO_TASKS.length; i++) {
    const demo = DEMO_TASKS[i];
    const label = await prisma.label.findUniqueOrThrow({
      where: { name: demo.label },
    });
    await prisma.task.create({
      data: {
        title: demo.title,
        description: demo.description,
        priority: demo.priority,
        labelId: label.id,
        order: i,
      },
    });
  }

  console.log("Done. Demo tasks are clearly seed data — delete them anytime from the Given list.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
