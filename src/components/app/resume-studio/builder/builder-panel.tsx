"use client";

import { AlignLeft, Award, Briefcase, FolderGit2, GraduationCap, IdCard, Layers } from "lucide-react";
import type { ResumeDocument, RichClaim } from "@/lib/schemas/resume-document";
import { isBlank } from "@/lib/resume-doc/rich-text";
import { BuilderSection } from "./builder-section";
import { HeaderFields, SummaryFields } from "./header-summary";
import { ExperienceFields } from "./experience-fields";
import { CertificationFields, EducationFields, ProjectFields, SkillsFields } from "./list-fields";

const toVerify = (claims: RichClaim[]) => claims.filter((c) => c.state === "UNVERIFIED" && !isBlank(c.html)).length;

/** Builder mode's left pane — every section as a collapsible form. */
export function BuilderPanel({ doc }: { doc: ResumeDocument }) {
  return (
    <div className="space-y-2.5">
      <BuilderSection id="header" title="Header" icon={IdCard}>
        <HeaderFields doc={doc} />
      </BuilderSection>
      <BuilderSection id="summary" title="Summary" icon={AlignLeft} unverified={toVerify([doc.summary])}>
        <SummaryFields doc={doc} />
      </BuilderSection>
      <BuilderSection id="experience" title="Experience" icon={Briefcase} count={doc.experience.length} unverified={toVerify(doc.experience.flatMap((e) => e.bullets))}>
        <ExperienceFields doc={doc} />
      </BuilderSection>
      <BuilderSection id="skills" title="Skills" icon={Layers} count={doc.skills.length}>
        <SkillsFields doc={doc} />
      </BuilderSection>
      <BuilderSection id="education" title="Education" icon={GraduationCap} count={doc.education.length}>
        <EducationFields doc={doc} />
      </BuilderSection>
      <BuilderSection id="certifications" title="Certifications" icon={Award} count={doc.certifications.length}>
        <CertificationFields doc={doc} />
      </BuilderSection>
      <BuilderSection id="projects" title="Projects" icon={FolderGit2} count={doc.projects.length} unverified={toVerify(doc.projects.map((p) => p.description))}>
        <ProjectFields doc={doc} />
      </BuilderSection>
    </div>
  );
}
