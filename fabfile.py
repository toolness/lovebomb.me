from fabric.api import *
from fabric.contrib.project import rsync_project

try:
    import fabfile_local
except ImportError:
    pass

@task
def deploy():
    run('mkdir -p %s' % env.remote_dir)
    rsync_project(remote_dir=env.remote_dir,
                  local_dir='static-files/')
    print "files placed in %s" % env.serve_dir
