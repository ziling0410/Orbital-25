import java.util.Optional;

class State {
    private final PQ<Event> pq;
    private final Optional<Shop> shop;
    private final Optional<Event> recentEvent;
    private final String recentEventString;
    private final double totalWaitingTime;
    private final int customersLeft;

    State(PQ<Event> pq, Shop shop) {
        this.pq = pq;
        this.shop = Optional.of(shop);
        this.recentEvent = Optional.empty();
        this.recentEventString = "";
        this.totalWaitingTime = 0.0;
        this.customersLeft = 0;
    }

    private State(PQ<Event> pq, Optional<Shop> shop,
            Optional<Event> event, String recentEventString, 
            int customersLeft, double totalWaitingTime) {
        this.pq = pq;
        this.shop = shop;
        this.recentEvent = event;
        this.recentEventString = recentEventString;
        this.totalWaitingTime = totalWaitingTime;
        this.customersLeft = customersLeft;
    }

    public Optional<State> next() {
        Optional<Event> currentEvent = this.pq.poll().t();
        return currentEvent.flatMap(x -> {
            int newCustomersLeft = this.customersLeft;
            double newTotalWaitingTime = this.totalWaitingTime;
            newTotalWaitingTime += x.getWaitingTime();
            newCustomersLeft += x.getCustomersLeft();
            Optional<Event> newEvent = this.shop
                .flatMap(y -> x.next(y)
                        .map(z -> z.t()));
            String recentEventString = x.toString();
            Optional<Shop> newShop = this.shop
                .flatMap(y -> x.next(y)
                        .map(z -> z.u()));
            Optional<PQ<Event>> newPq = newEvent
                .filter(y -> x != y)
                .map(y -> this.pq.poll().u().add(y))
                .or(() -> Optional.of(this.pq.poll().u()));
            Optional<Event> newRecentEvent = Optional.of(x);
            return this.editStatistics(newPq, newShop, newRecentEvent,
                    recentEventString, newCustomersLeft, newTotalWaitingTime);
        });
    }

    public Optional<State> editStatistics(Optional<PQ<Event>> newPq,
            Optional<Shop> newShop, Optional<Event> newRecentEvent,
            String recentEventString, int newCustomersLeft,
            double newTotalWaitingTime) {
        return newPq.map(x -> new State(x, newShop, recentEvent,
                recentEventString, newCustomersLeft, newTotalWaitingTime));
    }

    public boolean isEmpty() {
        return this.pq.isEmpty();
    }

    public int getCustomersLeft() {
        return this.customersLeft;
    }

    public double getTotalWaitingTime() {
        return this.totalWaitingTime;
    }
 
    @Override
    public String toString() {
        return this.recentEventString;
    }
}
