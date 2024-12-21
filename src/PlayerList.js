import React from 'react';

const PlayerList = ({ players, title, gender }) => {
  return (
    <div style={{ padding: '20px', backgroundColor: '#F9FAFB', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}>
      <h2 style={{ fontSize: '1.5rem', color: '#1D4ED8', textAlign: 'center' }}>{title}</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {players.map((player, index) => (
          <div key={index} style={{ padding: '10px', backgroundColor: '#fff', border: '1px solid #E5E7EB', borderRadius: '8px' }}>
            <p style={{ fontSize: '1rem', color: '#333' }}>
              {player.name}
              <a href={player.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.9rem', marginLeft: '10px', color: '#1D4ED8' }}>
                Wikidata
              </a>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlayerList;
