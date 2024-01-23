import { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';

function JobPosting({ url, by, time, title }) {
 return (
    <li className="post" role="listitem">
      <h2 className="post__title">
        {url ? (
          <a
            className="post__title__link"
            href={url}
            target="_blank"
            rel="noopener">
            {title}
          </a>
        ) : (
          title
        )}
      </h2>
      <p className="post__metadata">
        By {by} &middot;{' '}
        {new Date(time * 1000).toLocaleString()}
      </p>
    </li>
 );
}

const PAGE_SIZE = 6;

export default function App() {
 const [fetchingJobDetails, setFetchingJobDetails] =
    useState(false);
 const [jobIds, setJobIds] = useState(null);
 const [jobs, setJobs] = useState([]);
 const [page, setPage] = useState(0);

 useEffect(() => {
    fetchJobs(page);
 }, [page]);

 async function fetchJobIds(currPage) {
    let jobs = jobIds;
    if (!jobs) {
      const res = await axios.get(
        'https://hacker-news.firebaseio.com/v0/jobstories.json',
      );
      jobs = res.data;
      setJobIds(jobs);
    }

    const start = currPage * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    return jobs.slice(start, end);
 }

 async function fetchJobs(currPage) {
    const jobIdsForPage = await fetchJobIds(currPage);

    setFetchingJobDetails(true);
    const jobsForPage = await Promise.all(
      jobIdsForPage.map((jobId) =>
        axios.get(
          `https://hacker-news.firebaseio.com/v0/item/${jobId}.json`,
        ).then((res) => res.data),
      ),
    );
    setJobs([...jobs, ...jobsForPage]);

    setFetchingJobDetails(false);
 }

 return (
    <div className="app">
      <h1 className="title">Hacker News Jobs Board</h1>
      {jobIds == null ? (
        <div className="loading">Loading...</div>
      ) : (
        <ul>
          {jobs.map((job) => (
            <JobPosting key={job.id} {...job} />
          ))}
        </ul>
      )}
      {jobs.length > 0 &&
        page * PAGE_SIZE + PAGE_SIZE <
          jobIds.length && (
          <button
            className="load-more-button"
            disabled={fetchingJobDetails}
            onClick={() => setPage(page + 1)}>
            {fetchingJobDetails
              ? 'Loading...'
              : 'Load more jobs'}
          </button>
        )}
    </div>
 );
}
