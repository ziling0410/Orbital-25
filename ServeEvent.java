import java.util.Optional;

class ServeEvent extends Event {
    private final Server server;
    private final boolean wasWaiting;
    private final double serveTime;

    ServeEvent(Customer customer, Server server, double eventTime, 
            boolean wasWaiting, double serveTime) {
        super(customer, eventTime);
        this.server = server;
        this.wasWaiting = wasWaiting;
        this.serveTime = serveTime;
    }

    public Optional<Pair<Event,Shop>> next(Shop shop) {
        //double newEventTime = super.eventTime + shop.getServiceTime();
        Optional<Server> newServer = shop.getServer(this.server);
        Optional<Shop> newShop = Optional.of(shop);
        if (this.wasWaiting) {
            newServer = newServer.map(x -> x.removeFromQueue());
            newShop = newServer.map(x -> shop.removeQueue(x));
        }
        //newShop = shop.update(super.customer, newServer, newEventTime);
        return newShop.map(x -> new Pair<Event,Shop>(new DoneEvent(
                        super.customer, this.serveTime), x));
    }
    
    @Override
    public String toString() {
        return String.format("%.3f", super.eventTime) + " " + super.customer 
            + " serves by " + this.server;
    }
}
