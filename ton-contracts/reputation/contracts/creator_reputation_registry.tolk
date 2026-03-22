tolk 1.2

struct ReputationRecord {
    submittedCount: uint32
    boostedCount: uint32
    totalTonSpentNano: uint128
}

struct Storage {
    records: map<address, ReputationRecord>
}

fun Storage.load() {
    return Storage.fromCell(contract.getData())
}

fun Storage.save(self) {
    contract.setData(self.toCell())
}

fun createEmptyRecord(): ReputationRecord {
    return ReputationRecord {
        submittedCount: 0,
        boostedCount: 0,
        totalTonSpentNano: 0,
    }
}

struct (0x5355424d) RecordSubmission {}

struct (0x424f4f53) RecordBoost {
    amountNano: uint128
}

type AllowedMessage = RecordSubmission | RecordBoost

fun onInternalMessage(in: InMessage) {
    val msg = lazy AllowedMessage.fromSlice(in.body);

    match (msg) {
        RecordSubmission => {
            var storage = lazy Storage.load();
            var lookup = storage.records.get(in.senderAddress);
            var record = lookup.isFound ? lookup.loadValue() : createEmptyRecord();
            record.submittedCount += 1;
            storage.records.set(in.senderAddress, record);
            storage.save();
        }

        RecordBoost => {
            var storage = lazy Storage.load();
            var lookup = storage.records.get(in.senderAddress);
            var record = lookup.isFound ? lookup.loadValue() : createEmptyRecord();
            record.boostedCount += 1;
            record.totalTonSpentNano += msg.amountNano;
            storage.records.set(in.senderAddress, record);
            storage.save();
        }

        else => {
            assert (in.body.isEmpty()) throw 0xFFFF
        }
    }
}

fun onBouncedMessage(in: InMessageBounced) {}

get fun get_reputation(owner: address): (int, int, int) {
    val storage = lazy Storage.load();
    val lookup = storage.records.get(owner);

    if (lookup.isFound) {
        val record = lookup.loadValue();
        return (record.submittedCount, record.boostedCount, record.totalTonSpentNano);
    }

    return (0, 0, 0);
}
