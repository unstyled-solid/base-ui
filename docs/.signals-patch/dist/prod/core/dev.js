import "./core.js";

/**
 * Registers the console footer appended to the first console report of
 * each diagnostic code — a discovery pointer to deeper guidance. Reported
 * events carry it as trailing lines of the same console entry; events that
 * surface as a thrown error instead get it as a follow-up line. Returning
 * undefined for an event suppresses the footer. Passing undefined
 * unregisters and resets the once-per-code memory.
 *
 * @internal A seam for `solid-js`, which owns the repair skill the footer
 * names and installs it from both of its entries; not part of `DEV`. No-op
 * outside dev builds, where nothing reports to the console.
 */ function setConsoleFooter(o) {
    return;
}

const DEV = undefined;

export { DEV, setConsoleFooter };