
import java.nio.ByteBuffer;
import java.security.SecureRandom;
import java.util.Base64;
import java.util.UUID;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class KeyGenerator {
    public static void main(String[] args) {
        UUID id = UUID.fromString("123e4567-e89b-12d3-a456-426614174000");
        String tenantId = "default-tenant";
        
        SecureRandom secureRandom = new SecureRandom();
        byte[] secretBytes = new byte[32];
        // Use fixed bytes for reproducibility if needed, but random is fine as we just need ONE valid pair.
        // Actually, let's use fixed bytes to be deterministic for this "initial data" request if we want to share the key.
        // But better to just generate one and print it.
        secureRandom.nextBytes(secretBytes);
        
        String idPart = Base64.getUrlEncoder().withoutPadding().encodeToString(asBytes(id));
        String secretPart = Base64.getUrlEncoder().withoutPadding().encodeToString(secretBytes);
        
        String prefix = "ldop_sk_";
        String rawKey = prefix + idPart + "." + secretPart;
        
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        String keyHash = encoder.encode(rawKey);
        
        System.out.println("UUID: " + id);
        System.out.println("TenantID: " + tenantId);
        System.out.println("RawKey: " + rawKey);
        System.out.println("KeyHash: " + keyHash);
    }

    private static byte[] asBytes(UUID uuid) {
        ByteBuffer bb = ByteBuffer.wrap(new byte[16]);
        bb.putLong(uuid.getMostSignificantBits());
        bb.putLong(uuid.getLeastSignificantBits());
        return bb.array();
    }
}
