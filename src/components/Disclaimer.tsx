export function Disclaimer() {
  return (
    <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-700">
      <p className="text-xs text-gray-500 dark:text-gray-400">
        These estimates are based on{" "}
        <a
          href="https://platform.openai.com/docs/guides/images-vision?api-mode=responses#calculating-costs"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-gray-700 dark:hover:text-gray-300"
        >
          OpenAI's documentation
        </a>
        . We do not accept any responsibility for the accuracy of these
        estimates.
      </p>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
        Cost calculations are based on{" "}
        <a
          href="https://github.com/BerriAI/litellm"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-gray-700 dark:hover:text-gray-300"
        >
          LiteLLM
        </a>
        . We do not accept any responsibility for the accuracy of these cost
        estimates.
      </p>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
        Want to contribute or report issues? Visit our{" "}
        <a
          href="https://github.com/curefatih/image-token-estimator"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-gray-700 dark:hover:text-gray-300"
        >
          GitHub repository
        </a>
        .
      </p>
    </div>
  );
}
