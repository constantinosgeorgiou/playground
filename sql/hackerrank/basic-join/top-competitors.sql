SELECT Hackers.hacker_id,
    Hackers.name
FROM Submissions
    LEFT JOIN Hackers ON Submissions.hacker_id = Hackers.hacker_id
    LEFT JOIN Challenges ON Submissions.challenge_id = Challenges.challenge_id
    LEFT JOIN Difficulty ON Challenges.difficulty_level = Difficulty.difficulty_level
WHERE Submissions.score = Difficulty.score
GROUP BY Hackers.hacker_id, Hackers.name
HAVING COUNT(Submissions.submission_id) > 1
ORDER BY COUNT(Submissions.submission_id) DESC,
    Hackers.hacker_id ASC