import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getPlanLimits, type PlanType } from "@/lib/plans";
import { CollectForm } from "@/components/collect/CollectForm";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

interface CollectPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: CollectPageProps) {
  const { slug } = await params;

  const project = await prisma.project.findFirst({
    where: { slug },
    include: {
      collectPage: true,
      user: {
        select: { companyName: true },
      },
    },
  });

  if (!project || !project.collectPage) {
    return { title: "Not Found" };
  }

  const companyName = project.user.companyName || project.name;

  return {
    title: `${project.collectPage.title} - ${companyName}`,
    description: project.collectPage.description,
  };
}

export default async function CollectPage({ params }: CollectPageProps) {
  const { slug } = await params;

  const project = await prisma.project.findFirst({
    where: { slug },
    include: {
      collectPage: true,
      user: {
        select: {
          companyName: true,
          companyLogo: true,
          plan: true,
        },
      },
    },
  });

  if (!project || !project.collectPage) {
    notFound();
  }

  const planLimits = getPlanLimits(project.user.plan as PlanType);

  const config = {
    id: project.collectPage.id,
    title: project.collectPage.title,
    description: project.collectPage.description,
    thankYouMessage: project.collectPage.thankYouMessage,
    brandColor: project.collectPage.brandColor,
    collectVideo: project.collectPage.collectVideo,
    collectAvatar: project.collectPage.collectAvatar,
    collectCompany: project.collectPage.collectCompany,
    collectWebsite: project.collectPage.collectWebsite,
    promptQuestions: project.collectPage.promptQuestions,
  };

  const company = {
    name: project.user.companyName,
    logo: project.user.companyLogo,
  };

  const plan = {
    type: project.user.plan,
    videoTestimonials: planLimits.videoTestimonials,
    customBranding: planLimits.customBranding,
    removeBranding: planLimits.removeBranding,
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-muted/50 to-background">
      <div className="mx-auto max-w-2xl px-4 py-8 sm:py-16">
        {/* Company Logo & Branding */}
        <div className="mb-8 text-center">
          {company.logo && (
            <div className="mb-4 flex justify-center">
              <img
                src={company.logo}
                alt={company.name || "Company logo"}
                className="h-12 w-auto object-contain"
              />
            </div>
          )}
          {company.name && (
            <p
              className="text-sm font-medium uppercase tracking-wider"
              style={{ color: config.brandColor }}
            >
              {company.name}
            </p>
          )}
        </div>

        {/* Main Card */}
        <Card className="shadow-lg">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl sm:text-3xl font-bold">
              {config.title}
            </CardTitle>
            <CardDescription className="mt-2 text-base">
              {config.description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CollectForm
              slug={slug}
              config={config}
              projectName={project.name}
              company={company}
              plan={plan}
            />
          </CardContent>
        </Card>

        {/* Powered by / Branding Footer */}
        {!plan.removeBranding && (
          <div className="mt-6 text-center">
            <p className="text-xs text-muted-foreground">
              Powered by{" "}
              <Link
                href="/"
                className="font-medium underline-offset-4 hover:underline"
                style={{ color: config.brandColor }}
              >
                TestimonialBox
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
