import { type ReactElement } from 'react';
import { CandidateProfile } from '../types';

interface ProfilePreviewProps {
  profile?: CandidateProfile;
  account?: { name: string; email: string };
}

const ProfilePreview = ({ profile, account }: ProfilePreviewProps): ReactElement => {
  if (!profile) {
    return (
      <div className="glass backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">Saved Profile</h2>
        {account ? (
          <p className="text-white/70">
            {account.name} · {account.email}
          </p>
        ) : null}
        <p className="text-white/60">No profile saved yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="glass backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
      <h2 className="text-2xl font-bold text-white mb-6">Saved Profile</h2>
      {account ? (
        <p>
          <strong>{account.name}</strong>
          <br />
          {account.email}
        </p>
      ) : null}
      <p>
        <strong>Phone:</strong> {profile.phone || '—'}
      </p>

      {account ? (
        <div className="mb-6 pb-6 border-b border-white/10">
          <p className="text-white font-semibold">{account.name}</p>
          <p className="text-cyan-400">{account.email}</p>
        </div>
      ) : null}
      
      <p className="text-white/70 mb-6">
        <strong className="text-white">Phone:</strong> {profile.phone || '—'}
      </p>

      <section className="mb-6">
        <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
          <span className="w-1 h-5 bg-gradient-to-b from-blue-500 to-cyan-600 rounded"></span>
          Education
        </h3>
        <ul className="space-y-2">
          {profile.education.map((edu, index) => (
            <li key={`edu-${index}`} className="text-white/80 pl-4">
              <strong className="text-white">{edu.degree}</strong> · {edu.institution} ({edu.graduationYear})
            </li>
          ))}
        </ul>
      </section>

      <section className="mb-6">
        <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
          <span className="w-1 h-5 bg-gradient-to-b from-blue-500 to-cyan-600 rounded"></span>
          Skills
        </h3>
        <div className="flex flex-wrap gap-2">
          {profile.skills.map((skill) => (
            <span className="px-3 py-1 rounded-lg bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-400/30 text-cyan-300 text-sm font-medium" key={skill}>
              {skill}
            </span>
          ))}
        </div>
      </section>

      <section className="mb-6">
        <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
          <span className="w-1 h-5 bg-gradient-to-b from-blue-500 to-cyan-600 rounded"></span>
          Projects
        </h3>
        <ul className="space-y-3">
          {profile.projects.map((project, index) => (
            <li key={`project-${index}`} className="text-white/80 pl-4">
              <strong className="text-white">{project.name}</strong>
              {project.description ? <span className="text-white/60"> — {project.description}</span> : ''}
              {project.link ? (
                <a href={project.link} target="_blank" rel="noreferrer" className="text-cyan-400 hover:text-cyan-300 ml-2 underline">
                  View
                </a>
              ) : null}
            </li>
          ))}
        </ul>
      </section>

      {(profile.experience || []).length ? (
        <section className="mb-6">
          <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
            <span className="w-1 h-5 bg-gradient-to-b from-blue-500 to-cyan-600 rounded"></span>
            Experience
          </h3>
          <ul className="space-y-3">
            {profile.experience?.map((exp, index) => (
              <li key={`exp-${index}`} className="text-white/80 pl-4">
                <strong className="text-white">{exp.role}</strong> <span className="text-white/60">@</span> {exp.organization}
                {exp.duration ? <span className="text-white/60"> · {exp.duration}</span> : ''}
                {exp.summary ? <div className="text-white/60 text-sm mt-1">{exp.summary}</div> : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {profile.resumeSnapshot ? (
        <section className="mt-6 pt-6 border-t border-white/10">
          <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
            <span className="w-1 h-5 bg-gradient-to-b from-blue-500 to-cyan-600 rounded"></span>
            Resume Snapshot
          </h3>
          <p className="text-white/70">
            Last parsed from <strong className="text-cyan-400">{profile.resumeSnapshot.sourceName || 'upload'}</strong> on{' '}
            <span className="text-white">{new Date(profile.resumeSnapshot.parsedAt).toLocaleDateString()}</span>
          </p>
        </section>
      ) : null}
      </div>
    </div>
  );
};

export default ProfilePreview;
