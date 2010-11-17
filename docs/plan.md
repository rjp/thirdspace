Current state: 1a

JSON is always over HTTP, EDF is always over socket.

### 1. Add JSON support

     New clients <- JSON -> gateway <- EDF -> existing server
                   Existing clients <- EDF -> existing server

1a. UA bot that talks EDF to the existing server

1b. HTTP server that spawns bots according to requests

1c. Translation between the incoming JSON requests and the outgoing EDF requests

### 2. Migrate EDF to JSON

                            New clients <- JSON -> gateway <- EDF -> existing server
     Existing clients <- EDF -> gateway <- JSON -> gateway <- EDF -> existing server

2a. Socket server that spawns bots according to requests

2b. Translation between the incoming EDF requests and the outgoing JSON requests

2c. Verify existing client against socket server

2d. Move existing server to a new port

2e. Move socket server to current server port

### 3. Replace server

                            New clients <- JSON -> new server
     Existing clients <- EDF -> gateway <- JSON -> new server

### 4. Profit
