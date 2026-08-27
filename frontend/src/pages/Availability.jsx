import React, { useEffect, useState } from 'react';
import { useApp } from '../AppContext.jsx';
import { api } from '../api.js';

export default function Availability() {
  const { facilities, facilityId } = useApp();
  const [target, setTarget] = useState(facilityId);
  const [data, setData] = useState({ diagnostics: [], medicines: [] });
  const [query, setQuery] = useState('');
  const [queryType, setQueryType] = useState('test');
  const [searchResults, setSearchResults] = useState(null);

  useEffect(() => { setTarget(facilityId); }, [facilityId]);
  useEffect(() => { if (target) api.facilityAvailability(target).then(setData); }, [target]);

  const runSearch = async () => {
    if (!query.trim()) { setSearchResults(null); return; }
    const params = queryType === 'test' ? { test: query } : { medicine: query };
    setSearchResults(await api.searchAvailability(params));
  };

  return (
    <div className="page">
      <section className="card">
        <span className="eyebrow">Diagnostics &amp; medicine visibility</span>
        <h1>Know before you travel</h1>
        <p>Check whether a test or medicine is available here — or find the nearest facility that has it.</p>
        <label className="field">
          <span>Facility</span>
          <select value={target} onChange={(e) => setTarget(e.target.value)}>
            {facilities.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
          </select>
        </label>
      </section>

      <div className="two-col">
        <section className="card">
          <h3>Diagnostic tests</h3>
          <table className="mini-table">
            <tbody>
              {data.diagnostics.map((d) => (
                <tr key={d.id}>
                  <td>{d.test_name}</td>
                  <td>
                    {d.available
                      ? <span className="chip chip-available">Available · {d.next_slot}</span>
                      : <span className="chip chip-unavailable">Not available</span>}
                  </td>
                </tr>
              ))}
              {data.diagnostics.length === 0 && <tr><td className="muted">No diagnostic data recorded for this facility.</td></tr>}
            </tbody>
          </table>
        </section>

        <section className="card">
          <h3>Medicines</h3>
          <table className="mini-table">
            <tbody>
              {data.medicines.map((m) => (
                <tr key={m.id}>
                  <td>{m.medicine_name}</td>
                  <td>
                    <span className={`chip chip-${m.stock_status === 'available' ? 'available' : m.stock_status === 'low' ? 'low' : 'unavailable'}`}>
                      {m.stock_status.replace('_', ' ')}{m.quantity != null ? ` · ${m.quantity}` : ''}
                    </span>
                  </td>
                </tr>
              ))}
              {data.medicines.length === 0 && <tr><td className="muted">No medicine data recorded for this facility.</td></tr>}
            </tbody>
          </table>
        </section>
      </div>

      <section className="card">
        <h3>Find it elsewhere</h3>
        <div className="search-row">
          <select value={queryType} onChange={(e) => setQueryType(e.target.value)}>
            <option value="test">Diagnostic test</option>
            <option value="medicine">Medicine</option>
          </select>
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={queryType === 'test' ? 'e.g. ECG' : 'e.g. Metformin'} />
          <button className="btn-secondary" onClick={runSearch}>Search</button>
        </div>
        {searchResults && (
          <table className="mini-table" style={{ marginTop: '0.75rem' }}>
            <tbody>
              {searchResults.map((r, i) => (
                <tr key={i}>
                  <td>{r.facility_name} <span className="muted">({r.type.replace('_', ' ')})</span></td>
                  <td>
                    {r.test_name && (r.available
                      ? <span className="chip chip-available">Available · {r.next_slot}</span>
                      : <span className="chip chip-unavailable">Not available</span>)}
                    {r.medicine_name && (
                      <span className={`chip chip-${r.stock_status === 'available' ? 'available' : r.stock_status === 'low' ? 'low' : 'unavailable'}`}>
                        {r.stock_status.replace('_', ' ')}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
              {searchResults.length === 0 && <tr><td className="muted">No matches found.</td></tr>}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
