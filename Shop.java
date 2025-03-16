import java.util.stream.IntStream;
import java.util.Optional;
import java.util.List;
import java.util.function.Supplier;
import java.util.Comparator;

class Shop {
    private final List<Server> serversInShop;
    private final Supplier<Double> serviceTime;

    Shop(int noOfServers, Supplier<Double> serviceTime, int maxQueueLength) {
        this.serversInShop = IntStream
            .rangeClosed(1, noOfServers)
            .mapToObj(x -> new Server(x, maxQueueLength))
            .toList();
        this.serviceTime = serviceTime;
    }

    public Double getServiceTime() {
        return this.serviceTime.get();
    }
    
    private Shop(List<Server> servers, Supplier<Double> serviceTime) {
        this.serversInShop = servers;
        this.serviceTime = serviceTime;
    }

    public Optional<Server> findServer(Customer customer) {
        return this.serversInShop
            .stream()
            .filter(x -> x.canServe(customer))
            .findFirst();
    }

    public Optional<Server> findServerQueue() {
        return this.serversInShop
            .stream()
            .filter(x -> x.canQueue())
            .min(Comparator.comparingInt(Server::getId));
    }  
    
    @Override
    public String toString() {
        return this.serversInShop
            .toString();
    }
    
    public Shop update(Customer customer, Server originalServer) {
        Server updatedServer = originalServer.serve(customer, 
                this.getServiceTime());
        List<Server> newServers = IntStream
            .rangeClosed(1, this.serversInShop.size())
            .mapToObj(x -> (this.serversInShop.get(x - 1)
                        .sameServer(updatedServer)) ? updatedServer :
                    this.serversInShop.get(x - 1))
            .toList();
        return new Shop(newServers, this.serviceTime);
    }

    public Shop addQueue(Server server) {
        List<Server> newServers = IntStream
            .rangeClosed(1, this.serversInShop.size())
            .mapToObj(x -> (this.serversInShop.get(x - 1)
                        .sameServer(server)) ? server :
                    this.serversInShop.get(x - 1))
            .toList();
        return new Shop(newServers, this.serviceTime);
    }

    public Shop removeQueue(Server server) {
        List<Server> newServers = IntStream
            .rangeClosed(1, this.serversInShop.size())
            .mapToObj(x -> (this.serversInShop.get(x - 1)
                        .sameServer(server)) ? server :
                    this.serversInShop.get(x - 1))
            .toList();
        return new Shop(newServers, this.serviceTime);
    }
}
