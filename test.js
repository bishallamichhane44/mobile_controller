
//didn't print error, no connection either
useEffect(() => {
    try {
      const newSocket = Socket(address);
      setSocket(newSocket);
    } catch (error) {
      alert('Socket connection failed: ' + error.message);
    }
  
    return () => {
      if (socket) {
        socket.close();
        
      }
    };
  }, [address]);


  //sometimes connects but doesn't print error (best so far)
  useEffect(() => {
    setSocket(Socket(address));
    return () => socket && socket.close();
  }, []);



  //prints error, makes connection for sure  but don't give tilt data
  useEffect(() => {
    try {
      const newSocket = Socket(address); // Use the Socket function from socket.js

      newSocket.onopen = () => {
       
      };

      newSocket.onerror = (error) => {
        alert('Socket connection failed: ' + error.message);
      };

      newSocket.onclose = () => {
        alert('Socket connection closed.');
      };

      setSocket(newSocket);
    } catch (error) {
      alert('An error occurred: ' + error.message);
    }

    return () => {
      if (socket) {
        socket.close();
      }
    };
  }, [address]);
