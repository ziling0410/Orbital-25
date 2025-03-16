import java.util.stream.Stream;
import java.util.List;
import java.util.Optional;
import java.util.function.Supplier;

class Simulator {
    private final PQ<Event> pq;
    private final Shop shop;
    private final int noOfCustomers;

    Simulator(int numOfServers, int qmax, Supplier<Double> serviceTime,
            int noOfCustomers, List<Pair<Integer, Double>> arrivals) {
        this.shop = new Shop(numOfServers, serviceTime, qmax);
        PQ<Event> pq = new PQ<Event>();
        for (Pair<Integer, Double> i : arrivals) {
            pq = pq.add(new ArriveEvent(new Customer(i.t(), i.u()), i.u()));
        }
        this.pq = pq;
        this.noOfCustomers = noOfCustomers;
    }

    Pair<String, String> run() {
        int customersLeft = 0;
        double totalWaitingTime = 0.0;
        String output = Stream
            .iterate(Optional.of(new State(this.pq, this.shop)), 
                    state -> state.isPresent(),
                    state -> state.flatMap(x -> x.next()))
            .map(state -> state.map(x -> x.toString()).orElse(""))
            .filter(str -> !str.isEmpty())
            .reduce("", (x, y) -> x + y + "\n");
        Optional<Pair<Integer, Double>> values = Stream
            .iterate(Optional.of(new State(this.pq, this.shop)),
                state -> state.isPresent(),
                state -> state.flatMap(x -> x.next()))
            .reduce((x, y) -> y)
            .flatMap(x -> x.map(y -> new Pair<Integer, Double>(
                            y.getCustomersLeft(), y.getTotalWaitingTime())));
        String statistics = values
            .map(x -> {
                double averageWaitingTime = x.u() / (this.noOfCustomers
                        - x.t());
                int customersServed = this.noOfCustomers - x.t();
                return "[" + averageWaitingTime + " " + customersServed + " " 
                    + x.t() + "]";
            }).orElse("");
        return new Pair<String,String>(output, statistics);
    }
}
