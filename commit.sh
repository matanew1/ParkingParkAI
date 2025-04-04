#!/bin/bash

# This script adds all changes to the git staging area, commits them with a message, and pushes to the remote repository.
msg="$1"

echo "Committing changes with message: $msg"
git add .
git commit -m "$msg"
git push
echo "Changes pushed to remote repository."
echo "Done."
echo "You can now run the script with a commit message like this:"
echo "bash commit.sh 'Your commit message here'"