export JAVA_HOME="/c/Program Files/Java/jdk-17.0.2"
export PATH="$JAVA_HOME/bin:$PATH"
java -version
mvn clean package -Pnative -DskipTests
#-e -X