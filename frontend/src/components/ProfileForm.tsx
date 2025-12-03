import { FormEvent, useEffect, useState, type ReactElement } from 'react';
import { CandidateProfile, CandidateProfileRequest, Education, Experience, Project } from '../types';

interface ProfileFormProps {
  initialProfile?: CandidateProfile;
  initialAccount: { name: string; email: string };
  onSubmit: (payload: CandidateProfileRequest) => Promise<void>;
  submitting: boolean;
  autofillProfile?: Partial<CandidateProfile>;
  onAutofillApplied?: () => void;
}

const createEducation = (): Education => ({ degree: '', institution: '', graduationYear: '' });
const createProject = (): Project => ({ name: '', description: '', link: '' });
const createExperience = (): Experience => ({ organization: '', role: '', duration: '', summary: '' });

const withFallback = <T,>(list: T[] | undefined, factory: () => T): T[] => {
  return list && list.length ? list : [factory()];
};

const ProfileForm = ({ initialProfile, initialAccount, onSubmit, submitting, autofillProfile, onAutofillApplied }: ProfileFormProps): ReactElement => {
  const [profile, setProfile] = useState<CandidateProfile>({
    phone: '',
    education: [createEducation()],
    skills: [],
    projects: [createProject()],
    experience: [createExperience()],
  });
  const [account, setAccount] = useState(initialAccount);
  const [skillInput, setSkillInput] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialProfile) {
      setProfile({
        ...initialProfile,
        education: withFallback(initialProfile.education, createEducation),
        projects: withFallback(initialProfile.projects, createProject),
        experience: withFallback(initialProfile.experience, createExperience),
        skills: initialProfile.skills || [],
      });
    }
  }, [initialProfile]);

  useEffect(() => {
    setAccount(initialAccount);
  }, [initialAccount]);

  useEffect(() => {
    if (!autofillProfile) return;
    setProfile((prev) => ({
      ...prev,
      phone: autofillProfile.phone ?? prev.phone,
      education: withFallback(autofillProfile.education ?? prev.education, createEducation),
      projects: withFallback(autofillProfile.projects ?? prev.projects, createProject),
      experience: withFallback(autofillProfile.experience ?? prev.experience, createExperience),
      skills: autofillProfile.skills?.length ? Array.from(new Set([...(prev.skills || []), ...autofillProfile.skills])) : prev.skills,
    }));
    onAutofillApplied?.();
  }, [autofillProfile, onAutofillApplied]);

  const updateEducation = (index: number, field: keyof Education, value: string): void => {
    setProfile((prev) => {
      const education = [...prev.education];
      education[index] = { ...education[index], [field]: value };
      return { ...prev, education };
    });
  };

  const updateProject = (index: number, field: keyof Project, value: string): void => {
    setProfile((prev) => {
      const projects = [...prev.projects];
      projects[index] = { ...projects[index], [field]: value };
      return { ...prev, projects };
    });
  };

  const updateExperience = (index: number, field: keyof Experience, value: string): void => {
    setProfile((prev) => {
      const experience = [...(prev.experience || [])];
      experience[index] = { ...experience[index], [field]: value };
      return { ...prev, experience };
    });
  };

  const handleSubmit = async (event: FormEvent): Promise<void> => {
    event.preventDefault();

    if (!account.name || !account.email) {
      setError('Name and email are required.');
      return;
    }

    if (!profile.education.every((edu) => edu.degree && edu.institution && edu.graduationYear)) {
      setError('Please complete all education fields.');
      return;
    }

    if (!profile.projects.every((project) => project.name)) {
      setError('Each project must include at least a name.');
      return;
    }

    setError('');
    await onSubmit({
      name: account.name,
      email: account.email,
      phone: profile.phone,
      education: profile.education,
      skills: profile.skills,
      projects: profile.projects,
      experience: profile.experience,
    });
  };

  const addSkill = (): void => {
    const trimmed = skillInput.trim();
    if (trimmed && !profile.skills.includes(trimmed)) {
      setProfile((prev) => ({ ...prev, skills: [...prev.skills, trimmed] }));
    }
    setSkillInput('');
  };

  const removeSkill = (skill: string): void => {
    setProfile((prev) => ({ ...prev, skills: prev.skills.filter((s) => s !== skill) }));
  };

  const addEducation = (): void => {
    setProfile((prev) => ({ ...prev, education: [...prev.education, createEducation()] }));
  };

  const addProject = (): void => {
    setProfile((prev) => ({ ...prev, projects: [...prev.projects, createProject()] }));
  };

  const addExperience = (): void => {
    setProfile((prev) => ({ ...prev, experience: [...(prev.experience || []), createExperience()] }));
  };

  return (
    <form className="card" onSubmit={handleSubmit}>
      <h2>Candidate Profile</h2>

      <label>
        Name
        <input value={account.name} onChange={(e) => setAccount((prev) => ({ ...prev, name: e.target.value }))} />
      </label>

      <label>
        Email
        <input type="email" value={account.email} onChange={(e) => setAccount((prev) => ({ ...prev, email: e.target.value }))} />
      </label>

      <label>
        Phone
        <input value={profile.phone || ''} onChange={(e) => setProfile((prev) => ({ ...prev, phone: e.target.value }))} />
      </label>

      <section>
        <div className="section-header">
          <h3>Education</h3>
          <button className="text-button" type="button" onClick={addEducation}>
            + Add Education
          </button>
        </div>
        {profile.education.map((edu, index) => (
          <div className="fieldset" key={`edu-${index}`}>
            <input placeholder="Degree" value={edu.degree} onChange={(e) => updateEducation(index, 'degree', e.target.value)} />
            <input placeholder="Institution" value={edu.institution} onChange={(e) => updateEducation(index, 'institution', e.target.value)} />
            <input placeholder="Graduation Year" value={edu.graduationYear} onChange={(e) => updateEducation(index, 'graduationYear', e.target.value)} />
          </div>
        ))}
      </section>

      <section>
        <div className="section-header">
          <h3>Skills</h3>
        </div>
        <div className="skills-input">
          <input placeholder="Enter a skill" value={skillInput} onChange={(e) => setSkillInput(e.target.value)} />
          <button type="button" onClick={addSkill}>
            Add
          </button>
        </div>
        <div className="chips">
          {profile.skills.map((skill) => (
            <span className="chip" key={skill}>
              {skill}
              <button type="button" onClick={() => removeSkill(skill)}>
                ×
              </button>
            </span>
          ))}
        </div>
      </section>

      <section>
        <div className="section-header">
          <h3>Projects</h3>
          <button className="text-button" type="button" onClick={addProject}>
            + Add Project
          </button>
        </div>
        {profile.projects.map((project, index) => (
          <div className="fieldset" key={`project-${index}`}>
            <input placeholder="Project Name" value={project.name} onChange={(e) => updateProject(index, 'name', e.target.value)} />
            <input placeholder="Description" value={project.description || ''} onChange={(e) => updateProject(index, 'description', e.target.value)} />
            <input placeholder="Link" value={project.link || ''} onChange={(e) => updateProject(index, 'link', e.target.value)} />
          </div>
        ))}
      </section>

      <section>
        <div className="section-header">
          <h3>Experience</h3>
          <button className="text-button" type="button" onClick={addExperience}>
            + Add Experience
          </button>
        </div>
        {(profile.experience || []).map((exp, index) => (
          <div className="fieldset" key={`exp-${index}`}>
            <input placeholder="Organization" value={exp.organization} onChange={(e) => updateExperience(index, 'organization', e.target.value)} />
            <input placeholder="Role" value={exp.role} onChange={(e) => updateExperience(index, 'role', e.target.value)} />
            <input placeholder="Duration" value={exp.duration || ''} onChange={(e) => updateExperience(index, 'duration', e.target.value)} />
            <textarea placeholder="Summary" value={exp.summary || ''} onChange={(e) => updateExperience(index, 'summary', e.target.value)} />
          </div>
        ))}
      </section>

      {error && <p className="error">{error}</p>}

      <button className="primary" type="submit" disabled={submitting}>
        {submitting ? 'Saving...' : 'Save Profile'}
      </button>
    </form>
  );
};

export default ProfileForm;