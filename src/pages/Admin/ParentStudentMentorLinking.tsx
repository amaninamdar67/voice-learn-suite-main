import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Search, Users } from 'lucide-react';

interface User {
  id: string;
  full_name: string;
  email: string;
  role: string;
}

interface Link {
  id: string;
  parent_id: string;
  student_id?: string;
  mentor_id?: string;
  parent_name: string;
  student_name?: string;
  mentor_name?: string;
  relationship?: string;
}

export const ParentStudentMentorLinking: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'parent-student' | 'parent-mentor'>('parent-student');
  const [parents, setParents] = useState<User[]>([]);
  const [students, setStudents] = useState<User[]>([]);
  const [mentors, setMentors] = useState<User[]>([]);
  const [parentStudentLinks, setParentStudentLinks] = useState<Link[]>([]);
  const [parentMentorLinks, setParentMentorLinks] = useState<Link[]>([]);
  
  const [selectedParent, setSelectedParent] = useState<string>('');
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [selectedMentor, setSelectedMentor] = useState<string>('');
  const [relationship, setRelationship] = useState<string>('guardian');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [parentsRes, studentsRes, mentorsRes, psLinksRes, pmLinksRes] = await Promise.all([
        fetch('/api/admin/users?role=parent'),
        fetch('/api/admin/users?role=student'),
        fetch('/api/admin/users?role=mentor'),
        fetch('/api/admin/parent-student-links'),
        fetch('/api/admin/parent-mentor-links')
      ]);

      const [parentsData, studentsData, mentorsData, psData, pmData] = await Promise.all([
        parentsRes.json(),
        studentsRes.json(),
        mentorsRes.json(),
        psLinksRes.json(),
        pmLinksRes.json()
      ]);

      setParents(parentsData.users || []);
      setStudents(studentsData.users || []);
      setMentors(mentorsData.users || []);
      setParentStudentLinks(psData.links || []);
      setParentMentorLinks(pmData.links || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLinkParentStudent = async () => {
    if (!selectedParent || !selectedStudent) {
      alert('Please select both parent and student');
      return;
    }

    try {
      const response = await fetch('/api/admin/parent-student-links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          parent_id: selectedParent,
          student_id: selectedStudent,
          relationship
        })
      });

      if (response.ok) {
        setSelectedParent('');
        setSelectedStudent('');
        setRelationship('guardian');
        await loadData();
      }
    } catch (error) {
      console.error('Error linking parent-student:', error);
    }
  };

  const handleLinkParentMentor = async () => {
    if (!selectedParent || !selectedMentor || !selectedStudent) {
      alert('Please select parent, mentor, and student');
      return;
    }

    try {
      const response = await fetch('/api/admin/parent-mentor-links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          parent_id: selectedParent,
          mentor_id: selectedMentor,
          student_id: selectedStudent
        })
      });

      if (response.ok) {
        setSelectedParent('');
        setSelectedMentor('');
        setSelectedStudent('');
        await loadData();
      }
    } catch (error) {
      console.error('Error linking parent-mentor:', error);
    }
  };

  const handleDeleteLink = async (linkId: string, type: 'parent-student' | 'parent-mentor') => {
    if (!confirm('Are you sure you want to delete this link?')) return;

    try {
      const endpoint = type === 'parent-student' 
        ? `/api/admin/parent-student-links/${linkId}`
        : `/api/admin/parent-mentor-links/${linkId}`;

      const response = await fetch(endpoint, { method: 'DELETE' });
      if (response.ok) {
        await loadData();
      }
    } catch (error) {
      console.error('Error deleting link:', error);
    }
  };

  const filteredPSLinks = parentStudentLinks.filter(link =>
    link.parent_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    link.student_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredPMLinks = parentMentorLinks.filter(link =>
    link.parent_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    link.mentor_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return <div className="text-center text-slate-400 py-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-lg p-6">
        <h1 className="text-3xl font-bold text-white mb-2">Parent-Student-Mentor Linking</h1>
        <p className="text-slate-300">Manage relationships between parents, students, and mentors</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-700">
        <button
          onClick={() => setActiveTab('parent-student')}
          className={`px-4 py-2 font-semibold transition ${
            activeTab === 'parent-student'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-slate-400 hover:text-slate-300'
          }`}
        >
          <Users size={18} className="inline mr-2" />
          Parent-Student Links
        </button>
        <button
          onClick={() => setActiveTab('parent-mentor')}
          className={`px-4 py-2 font-semibold transition ${
            activeTab === 'parent-mentor'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-slate-400 hover:text-slate-300'
          }`}
        >
          <Users size={18} className="inline mr-2" />
          Parent-Mentor Links
        </button>
      </div>

      {/* Parent-Student Linking */}
      {activeTab === 'parent-student' && (
        <div className="space-y-6">
          {/* Add Link Form */}
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Plus size={20} />
              Link Parent to Student
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm text-slate-400 mb-2">Parent</label>
                <select
                  value={selectedParent}
                  onChange={(e) => setSelectedParent(e.target.value)}
                  className="w-full bg-slate-700 text-white px-3 py-2 rounded border border-slate-600 focus:outline-none focus:border-blue-500"
                >
                  <option value="">Select Parent</option>
                  {parents.map(p => (
                    <option key={p.id} value={p.id}>{p.full_name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2">Student</label>
                <select
                  value={selectedStudent}
                  onChange={(e) => setSelectedStudent(e.target.value)}
                  className="w-full bg-slate-700 text-white px-3 py-2 rounded border border-slate-600 focus:outline-none focus:border-blue-500"
                >
                  <option value="">Select Student</option>
                  {students.map(s => (
                    <option key={s.id} value={s.id}>{s.full_name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2">Relationship</label>
                <select
                  value={relationship}
                  onChange={(e) => setRelationship(e.target.value)}
                  className="w-full bg-slate-700 text-white px-3 py-2 rounded border border-slate-600 focus:outline-none focus:border-blue-500"
                >
                  <option value="mother">Mother</option>
                  <option value="father">Father</option>
                  <option value="guardian">Guardian</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={handleLinkParentStudent}
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                >
                  Link
                </button>
              </div>
            </div>
          </div>

          {/* Links List */}
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">Current Links</h2>
              <div className="relative">
                <Search size={18} className="absolute left-3 top-3 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-slate-700 text-white rounded border border-slate-600 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left py-3 px-4 text-slate-400">Parent</th>
                    <th className="text-left py-3 px-4 text-slate-400">Student</th>
                    <th className="text-left py-3 px-4 text-slate-400">Relationship</th>
                    <th className="text-left py-3 px-4 text-slate-400">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPSLinks.map(link => (
                    <tr key={link.id} className="border-b border-slate-700 hover:bg-slate-700/50">
                      <td className="py-3 px-4 text-white">{link.parent_name}</td>
                      <td className="py-3 px-4 text-white">{link.student_name}</td>
                      <td className="py-3 px-4 text-slate-300 capitalize">{link.relationship}</td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleDeleteLink(link.id, 'parent-student')}
                          className="text-red-400 hover:text-red-300 transition"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Parent-Mentor Linking */}
      {activeTab === 'parent-mentor' && (
        <div className="space-y-6">
          {/* Add Link Form */}
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Plus size={20} />
              Link Parent to Mentor
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm text-slate-400 mb-2">Parent</label>
                <select
                  value={selectedParent}
                  onChange={(e) => setSelectedParent(e.target.value)}
                  className="w-full bg-slate-700 text-white px-3 py-2 rounded border border-slate-600 focus:outline-none focus:border-blue-500"
                >
                  <option value="">Select Parent</option>
                  {parents.map(p => (
                    <option key={p.id} value={p.id}>{p.full_name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2">Student</label>
                <select
                  value={selectedStudent}
                  onChange={(e) => setSelectedStudent(e.target.value)}
                  className="w-full bg-slate-700 text-white px-3 py-2 rounded border border-slate-600 focus:outline-none focus:border-blue-500"
                >
                  <option value="">Select Student</option>
                  {students.map(s => (
                    <option key={s.id} value={s.id}>{s.full_name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2">Mentor</label>
                <select
                  value={selectedMentor}
                  onChange={(e) => setSelectedMentor(e.target.value)}
                  className="w-full bg-slate-700 text-white px-3 py-2 rounded border border-slate-600 focus:outline-none focus:border-blue-500"
                >
                  <option value="">Select Mentor</option>
                  {mentors.map(m => (
                    <option key={m.id} value={m.id}>{m.full_name}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={handleLinkParentMentor}
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                >
                  Link
                </button>
              </div>
            </div>
          </div>

          {/* Links List */}
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">Current Links</h2>
              <div className="relative">
                <Search size={18} className="absolute left-3 top-3 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-slate-700 text-white rounded border border-slate-600 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left py-3 px-4 text-slate-400">Parent</th>
                    <th className="text-left py-3 px-4 text-slate-400">Mentor</th>
                    <th className="text-left py-3 px-4 text-slate-400">Student</th>
                    <th className="text-left py-3 px-4 text-slate-400">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPMLinks.map(link => (
                    <tr key={link.id} className="border-b border-slate-700 hover:bg-slate-700/50">
                      <td className="py-3 px-4 text-white">{link.parent_name}</td>
                      <td className="py-3 px-4 text-white">{link.mentor_name}</td>
                      <td className="py-3 px-4 text-white">{link.student_name}</td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleDeleteLink(link.id, 'parent-mentor')}
                          className="text-red-400 hover:text-red-300 transition"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
