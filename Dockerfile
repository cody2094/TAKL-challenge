FROM node:10.16.3

RUN mkdir -p /home/takl/challenge

RUN apt-get -q update && apt-get -qy install netcat
RUN npm i npm@latest -g

# Handle API repo here
WORKDIR /home/takl/challenge
COPY package.json package-lock.json* ./
RUN npm install && npm cache clean --force
RUN npm install -g sequelize-cli
ENV PATH /opt/node_modules/.bin:$PATH

COPY . .

# Make sure db is ready to go before we run sequelize and start the API
RUN chmod +x ./wait-for.sh
CMD sh -c './wait-for.sh mysql-db:3306 -- sequelize db:migrate && npm start'

# Expose port
EXPOSE 8080



