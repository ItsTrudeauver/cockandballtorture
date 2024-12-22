import React, { useState, useEffect, useRef } from 'react';
import PlayerList from './PlayerList';

const App = () => {
  const [name, setName] = useState('');
  const [menCount, setMenCount] = useState(0);
  const [womenCount, setWomenCount] = useState(0);
  const [enteredNames, setEnteredNames] = useState({ men: [], women: [] });
  const [pendingNames, setPendingNames] = useState([]);
  const [timer, setTimer] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [notification, setNotification] = useState(null);
  const [timeIntervals, setTimeIntervals] = useState([]);
  const levenshteinDistance = (a, b) => {
    const matrix = Array.from({ length: b.length + 1 }, (_, i) =>
      Array.from({ length: a.length + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
    );
  
    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        matrix[i][j] =
          b[i - 1] === a[j - 1]
            ? matrix[i - 1][j - 1]
            : Math.min(matrix[i - 1][j - 1], matrix[i][j - 1], matrix[i - 1][j]) + 1;
      }
    }
  
    return matrix[b.length][a.length];
  };
  
  const areNamesSimilar = (name1, name2, threshold = 2) => {
    return levenshteinDistance(name1.toLowerCase(), name2.toLowerCase()) <= threshold;
  };
  

  const collator = new Intl.Collator('en', { sensitivity: 'base', ignorePunctuation: true });
  const lastCorrectTime = useRef(null);
  const menContainerRef = useRef(null);
  const womenContainerRef = useRef(null);

  const showNotification = (message) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 3000);
  };

  useEffect(() => {
    if (isRunning) {
      const interval = setInterval(() => setTimer((t) => t + 1), 1000);
      return () => clearInterval(interval);
    }
  }, [isRunning]);

  useEffect(() => {
    if (menContainerRef.current) {
      menContainerRef.current.scrollTop = menContainerRef.current.scrollHeight;
    }
    if (womenContainerRef.current) {
      womenContainerRef.current.scrollTop = womenContainerRef.current.scrollHeight;
    }
  }, [enteredNames]);

  const fetchWikidataInfo = async (inputName) => {
    const url = `https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${encodeURIComponent(inputName)}&language=en&limit=10&format=json&origin=*`;

    try {
      const res = await fetch(url);
      if (res.status === 429) {
        return { isValid: false, error: 'Rate limit exceeded. Please try again later.' };
      }

      const data = await res.json();
      if (data.search && data.search.length > 0) {
        const bestMatch =
          data.search.find((item) => item.label.toLowerCase().includes(inputName.toLowerCase())) ||
          data.search[0];

        const detailsRes = await fetch(
          `https://www.wikidata.org/wiki/Special:EntityData/${bestMatch.id}.json`
        );
        if (detailsRes.status === 429) {
          return { isValid: false, error: 'Rate limit exceeded on entity details. Please try again later.' };
        }

        const detailsData = await detailsRes.json();
        const entityData = detailsData.entities[bestMatch.id];
        const genderClaim = entityData.claims.P21?.[0]?.mainsnak?.datavalue?.value?.id;
        const imageClaim = entityData.claims.P18?.[0]?.mainsnak?.datavalue?.value;
        
        let gender;
            let genderNotification = `${bestMatch.label} does not have a clear gender identity.`;  // Default notification
  
            switch (genderClaim) {
              case 'Q6581097': // cisgender male
              case 'Q2449503': // transgender male (trans man)
                gender = 'male';
                genderNotification = `${bestMatch.label} is male.`;
                break;
              case 'Q6581072': // cisgender female
              case 'Q1052281': // transgender female (trans woman)
                gender = 'female';
                genderNotification = `${bestMatch.label} is female.`;
                break;
              case 'Q18274210': // non-binary
                gender = 'non-binary';
                genderNotification = `${bestMatch.label} is non-binary.`;
                break;
              case 'Q22258207': // genderfluid
                gender = 'genderfluid';
                genderNotification = `${bestMatch.label} is genderfluid.`;
                break;
              case 'Q20676560': // agender
                gender = 'agender';
                genderNotification = `${bestMatch.label} is agender.`;
                break;
              case 'Q1739990': // bigender
                gender = 'bigender';
                genderNotification = `${bestMatch.label} is bigender.`;
                break;
              case 'Q31431': // two-spirit
                gender = 'two-spirit';
                genderNotification = `${bestMatch.label} is two-spirit.`;
                break;
              case 'Q23408324': // genderqueer
                gender = 'genderqueer';
                genderNotification = `${bestMatch.label} is genderqueer.`;
                break;
              default:
                gender = null;
                genderNotification = `${bestMatch.label} has an unspecified or other gender identity.`;
                break;
        }

        if (!gender) return { isValid: false, error: `${bestMatch.label} is not a valid entity.` };

        const url = `https://www.wikidata.org/wiki/${bestMatch.id}`;
        return {
          isValid: true,
          gender,
          url,
          name: bestMatch.label,
          image: imageClaim
            ? `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(imageClaim)}`
            : null,
        };
      }
    } catch (error) {
      return { isValid: false, error: error.message };
    }

    return { isValid: false };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const normalizedName = name.normalize('NFD').trim().replace(/\p{Diacritic}/gu, '').replace(' ', '_');
    setPendingNames((prev) => [...prev, normalizedName]);
    setName('');
    const validation = await fetchWikidataInfo(normalizedName);
    setPendingNames((prev) => prev.filter((n) => n !== normalizedName));

    if (validation.error) {
      return;
    }

    if (
      [...enteredNames.men, ...enteredNames.women].some((n) =>
        areNamesSimilar(n.name, normalizedName)
      )
    ) {
      return;
    }
    

    if (!validation.isValid) {
      return;
    }

    const currentTime = new Date().getTime();
    if (lastCorrectTime.current) {
      const interval = ((currentTime - lastCorrectTime.current) / 1000).toFixed(3);
      setTimeIntervals((prev) => [...prev, interval]);
      validation.timeInterval = interval;
    } else {
      validation.timeInterval = timer.toFixed(3);
    }
    lastCorrectTime.current = currentTime;

    if (validation.gender === 'male' && menCount < 100) {
      setMenCount((c) => c + 1);
      setEnteredNames((prev) => ({ ...prev, men: [...prev.men, validation] }));
    } else if (validation.gender === 'female' && womenCount < 100) {
      setWomenCount((c) => c + 1);
      setEnteredNames((prev) => ({ ...prev, women: [...prev.women, validation] }));
    } else {
      return;
    }

    if (menCount + 1 === 100 && womenCount === 100) {
      setIsRunning(false);
    }
  };

  const startGame = () => {
    setMenCount(0);
    setWomenCount(0);
    setEnteredNames({ men: [], women: [] });
    setPendingNames([]);
    setTimer(0);
    setTimeIntervals([]);
    setIsRunning(true);
    lastCorrectTime.current = null;
  };

  const pauseGame = () => {
    if (window.confirm('Pause resets the game. Confirm?')) {
      setIsRunning(false);
    }
  };

  const styles = {
    container: {
      textAlign: 'center',
      padding: '20px',
      fontFamily: 'Open Sans, Arial, sans-serif',
      color: '#333',
      background: '#f0f0f5',
      borderRadius: '10px',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    },
    list: {
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      maxHeight: '300px',
      overflowY: 'auto',
    },
    listItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      border: '1px solid #ccc',
      borderRadius: '5px',
      padding: '10px',
      backgroundColor: '#fff',
    },
    nameBox: {
      flexGrow: 1,
      display: 'flex',
      alignItems: 'center',
      padding: '5px 10px',
      backgroundColor: '#f9f9f9',
      borderRadius: '5px',
    },
    link: {
      textDecoration: 'none',
      color: '#1D4ED8',
      fontSize: '0.9rem',
    },
    notification: {
      position: 'fixed',
      top: '20px',
      right: '20px',
      background: '#ffcc00',
      padding: '10px 20px',
      borderRadius: '5px',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
      zIndex: 1000,
      fontSize: '1rem',
      color: '#333',
    },
    header: {
      marginBottom: '10px',
      fontSize: '1rem',
      fontWeight: 'bold',
      color: '#333',
    },
  };

  const renderList = (players) => {
    if (!Array.isArray(players) || players.length === 0) {
      return <div style={{ textAlign: 'center', color: '#999' }}>No players to display.</div>;
    }

    return players.map((player, index) => (
      <div key={index} style={styles.listItem}>
        {player.image && (
          <img
            src={player.image}
            alt={player.name}
            style={{ width: '50px', height: '50px', borderRadius: '5px' }}
          />
        )}
        <a
          href={player.url}
          target="_blank"
          rel="noopener noreferrer"
          style={styles.link}
        >
          {player.name}
        </a>
        <span style={{ marginLeft: 'auto', fontSize: '0.9rem', color: '#555' }}>
          {player.timeInterval}s
        </span>
      </div>
    ));
  };

  return (
    <div style={styles.container}>
      {notification && <div style={styles.notification}>{notification}</div>}
      <h1 style={{ fontSize: '2.5rem', margin: '20px', color: '#5A5CFF' }}>
        100 Men & Women Naming Game
      </h1>
      <p style={{ fontSize: '1.2rem', color: '#555' }}>Time: {timer}s</p>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div style={styles.header}>Men: {menCount}/100</div>
        <div style={styles.header}>Women: {womenCount}/100</div>
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '20px',
          alignItems: 'start',
        }}
      >
        <div
          style={{
            overflow: 'auto',
            maxHeight: '300px',
            border: '1px solid #ccc',
            padding: '10px',
            borderRadius: '5px',
          }}
          ref={menContainerRef}
        >
          {renderList(enteredNames.men)}
        </div>
        <div
          style={{
            overflow: 'auto',
            maxHeight: '300px',
            border: '1px solid #ccc',
            padding: '10px',
            borderRadius: '5px',
          }}
          ref={womenContainerRef}
        >
          {renderList(enteredNames.women)}
        </div>
      </div>

      {!isRunning ? (
        <button
          onClick={startGame}
          style={{
            padding: '10px 20px',
            fontSize: '1rem',
            marginTop: '10px',
            backgroundColor: '#22C55E',
            color: 'white',
            borderRadius: '5px',
            cursor: 'pointer',
            border: 'none',
          }}
        >
          Start Game
        </button>
      ) : (
        <button
          onClick={pauseGame}
          style={{
            padding: '10px 20px',
            fontSize: '1rem',
            marginTop: '10px',
            backgroundColor: '#EF4444',
            color: 'white',
            borderRadius: '5px',
            cursor: 'pointer',
            border: 'none',
          }}
        >
          Pause Game
        </button>
      )}
      <form onSubmit={handleSubmit} style={{ marginTop: '20px' }}>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter a name"
          style={{
            padding: '10px',
            fontSize: '1rem',
            width: 'calc(100% - 20px)',
            borderRadius: '5px',
            border: '1px solid #ccc',
            marginBottom: '10px',
          }}
        />
        <button
          type="submit"
          style={{
            padding: '10px 20px',
            fontSize: '1rem',
            backgroundColor: '#3B82F6',
            color: 'white',
            borderRadius: '5px',
            cursor: 'pointer',
            border: 'none',
          }}
          disabled={!name.trim() || isRunning === false || pendingNames.includes(name)}
        >
          Submit
        </button>
      </form>
      {pendingNames.length > 0 && (
        <div style={{ marginTop: '10px', color: '#555' }}>
          Pending: {pendingNames.join(', ')}
        </div>
      )}
      {/*{timeIntervals.length > 0 && (
        <div style={{ marginTop: '20px' }}>
          <h2 style={{ fontSize: '1.2rem', color: '#333' }}>Time Intervals</h2>
          <div style={{ textAlign: 'center', fontSize: '1rem', color: '#555' }}>
            {timeIntervals.join('s, ')}s
          </div>
        </div>
      )}*/}
    </div>
  );
};

export default App;