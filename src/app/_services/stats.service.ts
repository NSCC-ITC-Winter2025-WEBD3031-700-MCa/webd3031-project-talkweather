import prisma from "@/lib/prisma";

export async function getDashboardStats() {
  const now = new Date();
  
  const hourAgo = new Date(now.getTime() - 1 * 60 * 60 * 1000);
  const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);

  const [
    totalPosts,
    yearlyPosts,
    monthlyPosts,
    weeklyPosts,
    dailyPosts,
    hourlyPosts,
    totalUsers,
    yearlyUsers,
    monthlyUsers,
    weeklyUsers,
    dailyUsers,
    hourlyUsers,
  ] = await Promise.all([
    prisma.post.count(),
    prisma.post.count({ where: { createdAt: { gte: yearAgo } } }),
    prisma.post.count({ where: { createdAt: { gte: monthAgo } } }),
    prisma.post.count({ where: { createdAt: { gte: weekAgo } } }),
    prisma.post.count({ where: { createdAt: { gte: dayAgo } } }),
    prisma.post.count({ where: { createdAt: { gte: hourAgo } } }),
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: yearAgo } } }),
    prisma.user.count({ where: { createdAt: { gte: monthAgo } } }),
    prisma.user.count({ where: { createdAt: { gte: weekAgo } } }),
    prisma.user.count({ where: { createdAt: { gte: dayAgo } } }),
    prisma.user.count({ where: { createdAt: { gte: hourAgo } } }),
  ]);

  return {
    posts: {
      total: totalPosts,
      yearly: yearlyPosts,
      monthly: monthlyPosts,
      weekly: weeklyPosts,
      daily: dailyPosts,
      hourly: hourlyPosts,
    },
    users: {
      total: totalUsers,
      yearly: yearlyUsers,
      monthly: monthlyUsers,
      weekly: weeklyUsers,
      daily: dailyUsers,
      hourly: hourlyUsers,
    },
  };
}

export type DashboardStats = Awaited<ReturnType<typeof getDashboardStats>>;