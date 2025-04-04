#!/bin/bash

# This script adds all changes to the git staging area, commits them with a message, and pushes to the remote repository.
msg="$1"

git add .
git commit -m "$msg"
git push