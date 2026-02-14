
import { RECIPIENTS_MAP, BLESSINGS_MAP } from '../src/utils/translations';
import { getManifestation } from '../src/constants/manifestations';

console.log("🔍 Starting Manifestation Matrix Audit...");

const recipients = RECIPIENTS_MAP.en;
const intentions = BLESSINGS_MAP.en;

let failures = 0;
let success = 0;

recipients.forEach(recipient => {
    intentions.forEach(intention => {
        const result = getManifestation(recipient, intention);
        
        // Check for Fallback
        if (result.title === "THE COSMIC BLESSING") {
            console.error(`❌ FAILURE: [${recipient} + ${intention}] -> Fallback triggered!`);
            failures++;
        } else {
            // Optional: Log success or just count
            // console.log(`✅ [${recipient} + ${intention}] -> ${result.title}`);
            success++;
        }
    });
});

console.log("-".repeat(50));
if (failures === 0) {
    console.log(`✅ AUDIT PASSED: All ${success} combinations mapped correctly.`);
} else {
    console.error(`❌ AUDIT FAILED: ${failures} combinations missing.`);
}
console.log("-".repeat(50));
