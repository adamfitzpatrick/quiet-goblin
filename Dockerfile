FROM ubuntu:14.04
RUN sudo apt-get update
RUN sudo apt-get install -y curl
RUN curl -sL https://deb.nodesource.com/setup_4.x | sudo -E bash -
RUN sudo apt-get install -y nodejs
COPY . /quiet-goblin
RUN cd /quiet-goblin && npm i
#ENTRYPOINT ["top", "-b"]
CMD cd /quiet-goblin && npm start