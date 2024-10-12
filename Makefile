NVM = $(HOME)/.nvm/nvm.sh

SHELL := /bin/zsh
.SHELLFLAGS := -i -c

clean:
	# Remove generated files
	find . -name "node_modules" | xargs -I {} rm -rf {}
	# Drop existing databases
	psql -c 'DROP DATABASE IF EXISTS coursemology; CREATE DATABASE coursemology;'
	psql -c 'DROP DATABASE IF EXISTS coursemology_test; CREATE DATABASE coursemology_test;'

prepare:
	git submodule update --init --recursive
	gem install bundler:2.5.9
	bundle config set --local without 'ci:production'
	bundle install
	cp env .env
	cp client/env client/.env

authentication-starting:
	cp authentication/env authentication/.env
	cd authentication && docker compose up

db-setup:
	bundle exec rake db:setup

client-starting:
	cp client/env client/.env
	$(NVM) use 18.17
	cd client && yarn && yarn build:development

backend-starting:
	cp env .env
	bundle exec rails s -p 3000

