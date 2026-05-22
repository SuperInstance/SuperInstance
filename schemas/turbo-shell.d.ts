/**
 * Turbo Shell Schema
 * Turbo manifest, shell types, and capability definitions
 */
export declare enum ShellType {
    BASH = "bash",
    ZSH = "zsh",
    FISH = "fish",
    POWERSHELL = "powershell",
    CMD = "cmd",
    PYTHON = "python",
    NODE = "node",
    RUST = "rust",
    GO = "go",
    DOCKER = "docker",
    SSH = "ssh",
    CUSTOM = "custom"
}
export declare enum Capability {
    EXECUTE_COMMAND = "execute_command",
    READ_FILE = "read_file",
    WRITE_FILE = "write_file",
    LIST_DIRECTORY = "list_directory",
    CREATE_DIRECTORY = "create_directory",
    DELETE_FILE = "delete_file",
    MOVE_FILE = "move_file",
    COPY_FILE = "copy_file",
    HTTP_GET = "http_get",
    HTTP_POST = "http_post",
    HTTP_PUT = "http_put",
    HTTP_DELETE = "http_delete",
    CONNECT_TCP = "connect_tcp",
    LISTEN_TCP = "listen_tcp",
    SPAWN_PROCESS = "spawn_process",
    KILL_PROCESS = "kill_process",
    GET_PROCESS_INFO = "get_process_info",
    LIST_PROCESSES = "list_processes",
    GET_SYSTEM_INFO = "get_system_info",
    GET_ENVIRONMENT = "get_environment",
    SET_ENVIRONMENT = "set_environment",
    READ_ENV_FILE = "read_env_file",
    DOCKER_RUN = "docker_run",
    DOCKER_BUILD = "docker_build",
    DOCKER_PULL = "docker_pull",
    DOCKER_PS = "docker_ps",
    DOCKER_LOGS = "docker_logs",
    GIT_CLONE = "git_clone",
    GIT_PUSH = "git_push",
    GIT_PULL = "git_pull",
    GIT_COMMIT = "git_commit",
    GIT_STATUS = "git_status",
    GIT_LOG = "git_log",
    NPM_INSTALL = "npm_install",
    NPM_PUBLISH = "npm_publish",
    PIP_INSTALL = "pip_install",
    CARGO_PUBLISH = "cargo_publish",
    SPAWN_AGENT = "spawn_agent",
    SEND_MESSAGE = "send_message",
    BROADCAST_MESSAGE = "broadcast_message",
    READ_DATABASE = "read_database",
    WRITE_DATABASE = "write_database",
    CACHE_SET = "cache_set",
    CACHE_GET = "cache_get",
    ADMIN = "admin",
    CONFIGURE = "configure",
    VIEW_LOGS = "view_logs"
}
export interface TurboManifest {
    id: string;
    name: string;
    version: string;
    shell_type: ShellType;
    description?: string;
    capabilities: Capability[];
    constraints?: Record<string, unknown>;
    environment?: Record<string, string>;
    working_directory?: string;
    timeout_ms?: number;
    metadata?: Record<string, unknown>;
}
