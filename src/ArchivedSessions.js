import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSessions } from './SessionStorage';
import { isMobile } from 'react-device-detect';

const ArchivedSessions = () => {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [sortOrder, setSortOrder] = useState({ key: 'totalTime', order: 'asc' });
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [jumpPage, setJumpPage] = useState('');
  const sessionsPerPage = 3; // Single column for all devices

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const fetchedSessions = await getSessions();
        setSessions(fetchedSessions);
      } catch (error) {
        console.error('Failed to fetch sessions:', error);
        setSessions([]);
      }
    };
    fetchSessions();
  }, []);

  const handleSort = (key) => {
    const sortedSessions = [...sessions].sort((a, b) => {
      const aValue = parseFloat(a[key]);
      const bValue = parseFloat(b[key]);
      return sortOrder.order === 'asc' ? aValue - bValue : bValue - aValue;
    });
    setSessions(sortedSessions);
    setSortOrder((prev) => ({
      key,
      order: prev.order === 'asc' ? 'desc' : 'asc',
    }));
  };

  const filteredSessions = sessions.filter((session) =>
    session.playerName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const indexOfLastSession = currentPage * sessionsPerPage;
  const indexOfFirstSession = indexOfLastSession - sessionsPerPage;
  const currentSessions = filteredSessions.slice(indexOfFirstSession, indexOfLastSession);

  const totalPages = Math.ceil(filteredSessions.length / sessionsPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const handleJumpToPage = () => {
    const page = parseInt(jumpPage, 10);
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
    setJumpPage('');
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Escape') {
      navigate(-1);
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', color: '#fff', padding: '20px' }}>
      <div
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          padding: '15px',
          borderRadius: '10px',
          width: isMobile ? '300px' : '600px',
          margin: '0 auto',
        }}
      >
        <h1 style={{ textAlign: 'center', fontSize: '1.5rem', marginBottom: '15px' }}>Sessions</h1>

        <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: '15px' }}>
          <span
            onClick={() => handleSort('totalTime')}
            style={{ cursor: 'pointer', color: sortOrder.key === 'totalTime' ? '#2ecc71' : '#fff' }}
          >
            Total Time
          </span>
          <span
            onClick={() => handleSort('menTime')}
            style={{ cursor: 'pointer', color: sortOrder.key === 'menTime' ? '#2ecc71' : '#fff' }}
          >
            Men Time
          </span>
          <span
            onClick={() => handleSort('womenTime')}
            style={{ cursor: 'pointer', color: sortOrder.key === 'womenTime' ? '#2ecc71' : '#fff' }}
          >
            Women Time
          </span>
        </div>

        <input
          type="text"
          placeholder="Search by player name"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            display: 'block',
            margin: '0 auto 15px',
            padding: '10px',
            fontSize: '1rem',
            width: '90%',
            maxWidth: '500px',
            borderRadius: '5px',
            border: '1px solid #ccc',
          }}
        />

        <div
          style={{
            height: '350px',
            overflowY: 'auto',
            padding: '10px',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '5px',
          }}
        >
          {currentSessions.length > 0 ? (
            <table style={{ width: '100%', borderCollapse: 'collapse', color: '#fff' }}>
              <thead>
                <tr>
                  <th style={{ border: '1px solid #ddd', padding: '8px' }}>Date</th>
                  <th style={{ border: '1px solid #ddd', padding: '8px' }}>Player</th>
                  <th style={{ border: '1px solid #ddd', padding: '8px' }}>M: Time</th>
                  <th style={{ border: '1px solid #ddd', padding: '8px' }}>W: Time</th>
                  <th style={{ border: '1px solid #ddd', padding: '8px' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {currentSessions.map((session, index) => (
                  <tr key={index}>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>{session.date}</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>{session.playerName}</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>M: {session.menTime}s</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>W: {session.womenTime}s</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>{session.totalTime}s</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No archived sessions found.</p>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px' }}>
          <button
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
            style={{
              padding: '10px 20px',
              fontSize: '1rem',
              backgroundColor: currentPage === 1 ? '#ccc' : '#3498DB',
              color: 'white',
              borderRadius: '5px',
              border: 'none',
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
            }}
          >
            Previous
          </button>

          <div style={{ textAlign: 'center' }}>
            <span style={{ fontSize: '1rem' }}>
              Page {currentPage} of {totalPages}
            </span>
            <div style={{ marginTop: '10px' }}>
              <input
                type="number"
                placeholder="Jump to page"
                value={jumpPage}
                onChange={(e) => setJumpPage(e.target.value)}
                style={{
                  padding: '5px',
                  fontSize: '1rem',
                  width: '100px',
                  borderRadius: '5px',
                  border: '1px solid #ccc',
                }}
              />
              <button
                onClick={handleJumpToPage}
                style={{
                  marginLeft: '10px',
                  padding: '5px 10px',
                  fontSize: '1rem',
                  backgroundColor: '#2ecc71',
                  color: 'white',
                  borderRadius: '5px',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Go
              </button>
            </div>
          </div>

          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            style={{
              padding: '10px 20px',
              fontSize: '1rem',
              backgroundColor: currentPage === totalPages ? '#ccc' : '#3498DB',
              color: 'white',
              borderRadius: '5px',
              border: 'none',
              cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
            }}
          >
            Next
          </button>
        </div>
      </div>

      <button
        onClick={() => navigate(-1)}
        style={{
          display: 'block',
          margin: '20px auto 0',
          padding: '10px 20px',
          fontSize: '1rem',
          backgroundColor: '#2ecc71',
          color: 'white',
          borderRadius: '5px',
          border: 'none',
          cursor: 'pointer',
        }}
      >
        Back
      </button>
    </div>
  );
};

export default ArchivedSessions;
