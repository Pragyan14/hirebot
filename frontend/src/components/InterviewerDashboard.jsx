import React, { useState } from 'react';
import { Search, X, ChevronRight, User, Bot } from 'lucide-react';

export default function InterviewerDashboard({ completedInterviews = [], inProgress = null }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  // Add in-progress user to the list if they exist
  const inProgressData = inProgress ? [{
    id: 'in-progress',
    answer: [],
    chatHistory: [],
    completedAt: null,
    messages: [],
    questions: [],
    scoreData: null,
    userInfo: inProgress,
    isInProgress: true
  }] : [];
  
  const allInterviews = [...inProgressData, ...completedInterviews]; 

  // Sort: in-progress first, then by score
  const sortedInterviews = [...allInterviews].sort((a, b) => {
    if (a.isInProgress) return -1;
    if (b.isInProgress) return 1;
    const scoreA = a.scoreData?.score ?? 0;
    const scoreB = b.scoreData?.score ?? 0;
    return scoreB - scoreA;
  });

  // Filter candidates
  const filteredInterviews = sortedInterviews.filter((interview) => {
    const name = interview.userInfo?.name?.toLowerCase() || '';
    const matchesSearch = name.includes(searchTerm.toLowerCase());
    
    let matchesStatus = true;
    
    if (statusFilter === 'Completed') {
      matchesStatus = interview.scoreData !== null;
    } else if (statusFilter === 'In Progress') {
      matchesStatus = interview.isInProgress || interview.scoreData === null;
    }
    
    return matchesSearch && matchesStatus;
  });

  const getStatus = (interview) => {
    if (interview.isInProgress || interview.scoreData === null) {
      return { label: 'In Progress', color: 'bg-blue-100 text-blue-700' };
    }
    return { label: 'Completed', color: 'bg-green-100 text-green-700' };
  };

  const getScore = (interview) => {
    if (interview.isInProgress || interview.scoreData === null) {
      return '-';
    }
    return interview.scoreData?.score ?? interview.scoreData?.finalScore ?? 0;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 md:px-8 py-3 md:py-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between max-w-7xl mx-auto gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-500 rounded"></div>
            <h1 className="text-lg md:text-xl font-semibold text-gray-900">Interview Dashboard</h1>
          </div>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-initial">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search candidates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
            >
              <option value="All Status">All Status</option>
              <option value="Completed">Completed</option>
              <option value="In Progress">In Progress</option>
            </select>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* Candidates Header */}
          <div className="px-4 md:px-6 py-4 border-b border-gray-200">
            <h2 className="text-base md:text-lg font-semibold text-gray-900">Candidates</h2>
            <p className="text-xs md:text-sm text-gray-500">Sorted by final score</p>
          </div>

          {/* Candidates List */}
          <div className="divide-y divide-gray-200">
            {filteredInterviews.length === 0 ? (
              <div className="px-6 py-12 text-center text-gray-500">
                No interviews found
              </div>
            ) : (
              filteredInterviews.map((interview) => {
                const status = getStatus(interview);
                const score = getScore(interview);
                
                return (
                  <div
                    key={interview.id}
                    onClick={() => setSelectedCandidate(interview)}
                    className="px-4 md:px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 md:gap-4 flex-1 w-full sm:w-auto">
                      <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-sm md:text-base flex-shrink-0">
                        {interview.userInfo?.name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-gray-900 text-sm md:text-base truncate">
                          {interview.userInfo?.name || 'Unknown'}
                        </h3>
                        <p className="text-xs md:text-sm text-gray-500 truncate">
                          {interview.userInfo?.email || 'No email'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 md:gap-6 w-full sm:w-auto justify-between sm:justify-end">
                      <div className="text-right">
                        <div className={`text-xl md:text-2xl font-bold ${score === '-' ? 'text-gray-400' : 'text-green-600'}`}>
                          {score}
                        </div>
                        <div className="text-xs text-gray-500">Score</div>
                      </div>

                      <div className={`px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-medium ${status.color} whitespace-nowrap`}>
                        {status.label}
                      </div>

                      <ChevronRight className="w-4 h-4 md:w-5 md:h-5 text-gray-400 flex-shrink-0" />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Candidate Details Modal */}
      {selectedCandidate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="px-4 md:px-6 py-3 md:py-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
              <h2 className="text-lg md:text-xl font-semibold text-gray-900">Candidate Details</h2>
              <button
                onClick={() => setSelectedCandidate(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="overflow-y-auto max-h-[calc(90vh-60px)]">
              {/* Candidate Info */}
              <div className="px-4 md:px-6 py-4 md:py-6 border-b border-gray-200">
                <div className="flex items-start gap-3 md:gap-4">
                  <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-lg md:text-2xl font-semibold flex-shrink-0">
                    {selectedCandidate.userInfo?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg md:text-xl font-semibold text-gray-900 break-words">
                      {selectedCandidate.userInfo?.name || 'Unknown'}
                    </h3>
                    <p className="text-xs md:text-sm text-gray-600 mt-1 break-all">
                      {selectedCandidate.userInfo?.email || 'No email'}
                    </p>
                    <p className="text-xs md:text-sm text-gray-600">
                      {selectedCandidate.userInfo?.phone || 'No phone'}
                    </p>
                  </div>
                </div>

                {/* Score */}
                <div className="mt-4 md:mt-6 p-3 md:p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-xs md:text-sm font-medium text-gray-700">Final Score</span>
                    {selectedCandidate.isInProgress || selectedCandidate.scoreData === null ? (
                      <span className="text-2xl md:text-3xl font-bold text-gray-400">
                        In Progress
                      </span>
                    ) : (
                      <span className="text-2xl md:text-3xl font-bold text-green-600">
                        {selectedCandidate.scoreData?.score ?? selectedCandidate.scoreData?.finalScore ?? 0}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* AI Summary */}
              {selectedCandidate.scoreData?.summary && (
                <div className="px-4 md:px-6 py-4 md:py-6 border-b border-gray-200">
                  <h4 className="text-xs md:text-sm font-semibold text-gray-700 mb-2 md:mb-3">AI Summary</h4>
                  <p className="text-xs md:text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                    {selectedCandidate.scoreData.summary}
                  </p>
                </div>
              )}

              {/* Chat History */}
              <div className="px-4 md:px-6 py-4 md:py-6">
                <h4 className="text-xs md:text-sm font-semibold text-gray-700 mb-3 md:mb-4">Interview Chat History</h4>
                {selectedCandidate.chatHistory && selectedCandidate.chatHistory.length > 0 ? (
                  <div className="space-y-3 md:space-y-4">
                    {selectedCandidate.chatHistory.map((message) => (
                      <div
                        key={message.id}
                        className={`flex items-start gap-2 md:gap-3 ${
                          message.type === 'user' ? 'flex-row-reverse' : ''
                        }`}
                      >
                        <div
                          className={`w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                            message.type === 'bot' 
                              ? 'bg-green-500' 
                              : 'bg-blue-500'
                          }`}
                        >
                          {message.type === 'bot' ? (
                            <Bot className="w-3 h-3 md:w-4 md:h-4 text-white" />
                          ) : (
                            <User className="w-3 h-3 md:w-4 md:h-4 text-white" />
                          )}
                        </div>

                        <div
                          className={`max-w-[75%] md:max-w-md px-3 md:px-4 py-2 rounded-lg ${
                            message.type === 'user'
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          <p className="text-xs md:text-sm leading-relaxed whitespace-pre-wrap break-words">
                            {message.content}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-sm text-gray-500">
                      {selectedCandidate.isInProgress 
                        ? 'Interview in progress - chat history will appear here'
                        : 'No chat history available'
                      }
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}