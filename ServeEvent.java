class Server {
    private final int id;
    private final double nextCustomerTime;
    private final int maxQueueLength;
    private final int currentQueue;

    Server(int id, int maxQueueLength) {
        this.id = id;
        this.nextCustomerTime = 0.0;
        this.maxQueueLength = maxQueueLength;
        this.currentQueue = 0;
    }
    
    private Server(int id, double serviceTime, int maxQueueLength, 
            int currentQueue) {
        this.id = id;
        this.nextCustomerTime = serviceTime;
        this.maxQueueLength = maxQueueLength;
        this.currentQueue = currentQueue;
    }

    @Override
    public String toString() {
        return "server " + this.id;
    }

    public Server addToQueue() {
        if (this.canQueue()) {
            return new Server(this.id, this.nextCustomerTime, 
                this.maxQueueLength, this.currentQueue + 1);
        }
        return this;
    }

    public Server removeFromQueue() {
        if (this.currentQueue > 0) {
            return new Server(this.id, this.nextCustomerTime,
                this.maxQueueLength, this.currentQueue - 1);
        }
        return this;
        
    }

    public Server serve(Customer customer, double serviceTime) {
        return new Server(this.id, serviceTime, this.maxQueueLength, 
                this.currentQueue);
    }

    public boolean canServe(Customer customer) {
        return customer.canBeServed(this.nextCustomerTime);
    }

    public boolean canQueue() {
        return this.maxQueueLength > this.currentQueue;
    }

    public boolean sameServer(Server server) {
        return this.id == server.id;
    }

    public double getNextCustomerTime() {
        return this.nextCustomerTime;
    }

    public int getQueue() {
        return this.currentQueue;
    }

    public boolean canServeAtTime(double time) {
        return this.nextCustomerTime <= time;
    }
}
