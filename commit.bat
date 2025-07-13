@echo off

REM This script adds all changes to the git staging area, commits them with a message, and pushes to the remote repository.
set msg=%*

echo Committing changes with message: %msg%
git add .
git commit -m "%msg%"
git push
echo Changes pushed to remote repository.
echo Done.
echo You can now run the script with a commit message like this:
echo commit.bat "Your commit message here"