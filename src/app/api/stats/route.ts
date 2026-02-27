import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Get all project IDs for this user
    const projects = await prisma.project.findMany({
      where: { userId },
      select: { id: true },
    });

    const projectIds = projects.map((p) => p.id);

    if (projectIds.length === 0) {
      return NextResponse.json({
        totalTestimonials: 0,
        pendingReview: 0,
        averageRating: 0,
        widgetImpressions: 0,
        ratingDistribution: [
          { rating: 1, count: 0 },
          { rating: 2, count: 0 },
          { rating: 3, count: 0 },
          { rating: 4, count: 0 },
          { rating: 5, count: 0 },
        ],
        monthlyTrend: [],
      });
    }

    // Run all queries in parallel
    const [
      totalTestimonials,
      pendingReview,
      avgResult,
      ratingGroups,
    ] = await Promise.all([
      // Total testimonials
      prisma.testimonial.count({
        where: { projectId: { in: projectIds } },
      }),

      // Pending review count
      prisma.testimonial.count({
        where: {
          projectId: { in: projectIds },
          status: "PENDING",
        },
      }),

      // Average rating
      prisma.testimonial.aggregate({
        where: { projectId: { in: projectIds } },
        _avg: { rating: true },
      }),

      // Rating distribution
      prisma.testimonial.groupBy({
        by: ["rating"],
        where: { projectId: { in: projectIds } },
        _count: { rating: true },
      }),
    ]);

    // Build rating distribution (ensure all ratings 1-5 are represented)
    const ratingMap = new Map<number, number>();
    for (const group of ratingGroups) {
      ratingMap.set(group.rating, group._count.rating);
    }
    const ratingDistribution = [1, 2, 3, 4, 5].map((rating) => ({
      rating,
      count: ratingMap.get(rating) || 0,
    }));

    // Monthly trend for last 6 months
    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    const monthlyResults = await prisma.testimonial.groupBy({
      by: ["createdAt"],
      where: {
        projectId: { in: projectIds },
        createdAt: { gte: sixMonthsAgo },
      },
      _count: { id: true },
    });

    // Aggregate by month
    const monthlyMap = new Map<string, number>();
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      monthlyMap.set(key, 0);
    }

    for (const result of monthlyResults) {
      const date = new Date(result.createdAt);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      if (monthlyMap.has(key)) {
        monthlyMap.set(key, (monthlyMap.get(key) || 0) + result._count.id);
      }
    }

    const monthlyTrend = Array.from(monthlyMap.entries()).map(
      ([month, count]) => {
        const [year, m] = month.split("-");
        const date = new Date(parseInt(year), parseInt(m) - 1);
        const label = date.toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
        });
        return { month: label, count };
      }
    );

    return NextResponse.json({
      totalTestimonials,
      pendingReview,
      averageRating: avgResult._avg.rating
        ? Math.round(avgResult._avg.rating * 10) / 10
        : 0,
      widgetImpressions: 0, // Placeholder
      ratingDistribution,
      monthlyTrend,
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
